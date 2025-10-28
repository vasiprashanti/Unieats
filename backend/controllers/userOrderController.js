import Cart from "../models/Cart.model.js";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Vendor from "../models/Vendor.model.js";

// Step 1 - Place Order & Initiate Payment
const placeOrder = async (req, res) => {
    let { addressId, paymentMethod } = req.body;
    const userId = req.user._id;
    paymentMethod = paymentMethod ? paymentMethod.toUpperCase() : null;

    if (!paymentMethod) {
        return res.status(400).json({ message: "Payment method is required." });
    }

    try {
        // 1️⃣ Find the user's cart
        const cart = await Cart.findOne({ user: userId }).populate("items.menuItem", "name");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2️⃣ Determine the delivery address
        if (!addressId) {
            return res.status(400).json({ message: "Address ID is required." });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Selected address not found." });
        }

        const deliveryAddressObject = {
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
        };

        // 3️⃣ Create snapshot items array
        const orderItems = cart.items.map((item) => ({
            menuItem: item.menuItem._id,
            name: item.menuItem.name,
            price: item.price,
            quantity: item.quantity,
        }));

        // 4️⃣ Create order payload
        const orderPayload = {
            user: userId,
            vendor: cart.vendor,
            items: orderItems,
            totalPrice: cart.total,
            deliveryAddress: deliveryAddressObject,
            paymentDetails: { method: paymentMethod },
        };

        // 5️⃣ Handle payment logic
        if (paymentMethod === "UPI") {
            const vendor = await Vendor.findById(cart.vendor);

            if (!vendor || !vendor.upiId) {
                return res.status(400).json({
                    message: "This vendor is not currently accepting UPI payments.",
                });
            }

            orderPayload.status = "pending";
            orderPayload.paymentDetails = {
                method: "UPI",
                status: "pending",
                upiId: vendor.upiId // Store the UPI ID in the order
            };
            const order = new Order(orderPayload);
            await order.save();

            return res.status(201).json({
                success: true,
                message: "Order placed. Please complete the payment.",
                data: {
                    orderId: order._id,
                    amount: order.totalPrice,
                    upiId: vendor.upiId,
                },
            });
        } else if (paymentMethod === "COD") {
            orderPayload.status = "pending";
            orderPayload.paymentDetails.status = "pending";

            const order = new Order(orderPayload);
            await order.save();

            // Clear cart
            await Cart.deleteOne({ user: userId });

            // Notify vendor
            const io = req.app.get("socketio");
            io.to(order.vendor.toString()).emit("new_order", order);

            return res.status(201).json({
                success: true,
                message: "Order placed successfully!",
                data: order,
            });
        }

        return res.status(400).json({ message: "Invalid payment method provided." });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Order validation failed.",
                details: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error while placing order.",
        });
    }
};


// Step 2 - Confirm UPI Payment
const confirmUpiPayment = async (req, res) => {
  const { orderId } = req.params;
  const { transactionId } = req.body;
  const userId = req.user._id;

  if (!transactionId) {
    return res.status(400).json({ message: "Transaction ID is required." });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    // Security checks
    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to confirm this payment." });
    }
    if (order.status !== "payment_pending") {
      return res
        .status(400)
        .json({ message: "This order is not awaiting payment." });
    }

    // Update the order
    order.status = "pending"; // This is the status for the vendor to start preparing
    order.paymentDetails = {
      method: "UPI",
      transactionId: transactionId,
      status: "completed",
    };
    // Add to status history
    order.statusHistory.push({ status: "pending", timestamp: new Date() });

    await order.save();

    // Now clear the user's cart
    await Cart.deleteOne({ user: userId });

    // Notify the vendor of the new, paid order
    const io = req.app.get("socketio");
    io.to(order.vendor.toString()).emit("new_order", order);

    res.status(200).json({
      success: true,
      message: "Payment confirmed. Your order is being prepared!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate("vendor", "businessName profileImage upiId") // Include upiId from vendor
      .sort({ createdAt: -1 }); // Show the most recent orders first

    // Process orders to include UPI ID for payment_pending orders
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // If order is payment_pending and using UPI, include vendor's UPI ID
      if (orderObj.status === "payment_pending" && 
          orderObj.paymentDetails?.method === "UPI" && 
          orderObj.vendor?.upiId) {
            orderObj.paymentDetails.upiId = orderObj.vendor.upiId;
      }
      return orderObj;
    });

    res.status(200).json({ success: true, count: processedOrders.length, data: processedOrders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Rate all MenuItems in a bulk manner
// POST /orders/:orderId/rate
const rateOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const ratings = req.body.ratings; // [{ menuItem: ObjectId, value: Number }]

    //Check if the req.body has the ratings array
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ message: "Ratings array required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    // if (order.user.toString() !== userId.toString()) {
    //   return res
    //     .status(403)
    //     .json({ message: "Not authorized for this order." });
    // }
    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Order must be delivered to rate." });
    }
    if (order.isRated) {
      return res.status(400).json({ message: "Order already rated." });
    }

    // Only allow rating items that are in the order and prevent duplicate ratings
    const orderItemIds = order.items.map((i) => i.menuItem.toString());
    for (const r of ratings) {
      const item = await MenuItem.findById(r.menuItem);

      if (!orderItemIds.includes(r.menuItem)) {
        return res
          .status(400)
          .json({ message: "Invalid menu item in ratings." });
      }
      if (typeof r.value !== "number" || r.value < 1 || r.value > 5) {
        return res.status(400).json({ message: "Rating value must be 1-5." });
      }
      // Check for duplicate rating
      if (
        item &&
        item.ratings &&
        item.ratings.find(
          (rt) =>
            rt.user.toString() === userId.toString() && rt.order === orderId
        )
      ) {
        return res.status(409).json({
          message: "You have already rated this item for this order.",
        });
      }
    }

    // update average rating for each menu item and save to the database
    await Promise.all(
      ratings.map(async (r) => {
        const item = await MenuItem.findById(r.menuItem);
        if (!item) return;
        item.ratings.push({
          user: userId,
          order: orderId,
          value: r.value,
          createdAt: new Date(),
        });
        const avg =
          item.ratings.reduce((sum, rt) => sum + rt.value, 0) /
          item.ratings.length;
        item.averageRating = Math.round(avg * 10) / 10;
        await item.save();
      })
    );

    order.isRated = true;
    await order.save();

    res.status(200).json({ message: "Ratings submitted successfully." });
  } catch (error) {
    console.error("Error in rateOrderItems:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { placeOrder, confirmUpiPayment, getUserOrders, rateOrderItems };
