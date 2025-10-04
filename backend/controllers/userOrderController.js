import Cart from "../models/Cart.model.js";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Vendor from "../models/Vendor.model.js";

// Step 1 - Place Order & Initiate Payment
const placeOrder = async (req, res) => {
    console.log("🟢 [START] placeOrder endpoint hit");
    console.log("➡️ Request body:", req.body);

    const { addressId, paymentMethod } = req.body;
    const userId = req.user._id;
    console.log("👤 User ID:", userId);
    console.log("💳 Payment method:", paymentMethod);
    console.log("🏠 Address ID:", addressId);

    // Basic validation
    if (!paymentMethod) {
        console.log("❌ Missing payment method");
        return res.status(400).json({ message: 'Payment method is required.' });
    }

    try {
        // 1️⃣ Find the user's cart
        console.log("🛒 Fetching cart for user...");
        const cart = await Cart.findOne({ user: userId }).populate('items.menuItem', 'name');
        console.log("📦 Cart data:", cart);

        if (!cart || cart.items.length === 0) {
            console.log("❌ Cart empty or not found");
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        const user = await User.findById(userId);
        console.log("👤 User fetched:", user);

        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: 'User not found.' });
        }

        // 2️⃣ Determine the delivery address
        console.log("📍 Determining delivery address...");
        let deliveryAddressObject;

        if (user.accommodation === 'Hosteller' && user.hostelDetails) {
            console.log("🏫 User is a hosteller, using hostel details:", user.hostelDetails);
            deliveryAddressObject = {
                street: `Hostel Block ${user.hostelDetails.block}, Room ${user.hostelDetails.room}`,
                city: process.env.CAMPUS_CITY,
                state: process.env.CAMPUS_STATE,
                zipCode: process.env.CAMPUS_ZIP_CODE,
            };
        } else if (user.accommodation === 'Non-Hosteller') {
            console.log("🏠 User is a non-hosteller");

            if (!addressId) {
                console.log("❌ Missing addressId for non-hosteller");
                return res.status(400).json({ message: 'Address ID is required for non-hostellers.' });
            }

            const address = user.addresses.id(addressId);
            console.log("📦 Address found:", address);

            if (!address) {
                console.log("❌ Address not found for given addressId");
                return res.status(404).json({ message: 'Selected address not found.' });
            }

            deliveryAddressObject = {
                street: address.addressLine1 || address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
            };
        } else {
            console.log("❌ Cannot determine user accommodation type");
            return res.status(400).json({ message: 'Cannot determine delivery address. Please complete your profile.' });
        }

        console.log("✅ Final delivery address object:", deliveryAddressObject);

        // 3️⃣ Create snapshot items array
        console.log("🧾 Creating order items snapshot...");
        const orderItems = cart.items.map(item => ({
            menuItem: item.menuItem._id,
            name: item.menuItem.name,
            price: item.price,
            quantity: item.quantity,
        }));
        console.log("🧾 Order items:", orderItems);

        // 4️⃣ Create order payload
        const orderPayload = {
            user: userId,
            vendor: cart.vendor,
            items: orderItems,
            totalPrice: cart.total,
            deliveryAddress: deliveryAddressObject,
            paymentDetails: { method: paymentMethod },
        };
        console.log("📦 Order payload before save:", orderPayload);

        // 5️⃣ Handle payment logic
        if (paymentMethod === 'upi') {
            console.log("💰 Handling UPI payment...");
            const vendor = await Vendor.findById(cart.vendor);
            console.log("🏪 Vendor fetched:", vendor);

            if (!vendor || !vendor.upiId) {
                console.log("❌ Vendor missing UPI ID");
                return res.status(400).json({ message: 'This vendor is not currently accepting UPI payments.' });
            }

            orderPayload.status = 'payment_pending';
            const order = new Order(orderPayload);
            await order.save();
            console.log("✅ UPI order created:", order);

            return res.status(201).json({
                success: true,
                message: 'Order placed. Please complete the payment.',
                data: {
                    orderId: order._id,
                    amount: order.totalPrice,
                    upiId: vendor.upiId,
                },
            });
        } 
        else if (paymentMethod === 'cod') {
            console.log("💵 Handling Cash on Delivery...");
            orderPayload.status = 'pending';
            orderPayload.paymentDetails.status = 'pending';

            const order = new Order(orderPayload);
            await order.save();
            console.log("✅ COD order created:", order);

            // Clear cart
            console.log("🧹 Clearing cart...");
            await Cart.deleteOne({ user: userId });

            // Notify vendor
            console.log("📢 Emitting new_order event to vendor:", order.vendor);
            const io = req.app.get('socketio');
            io.to(order.vendor.toString()).emit('new_order', order);

            return res.status(201).json({
                success: true,
                message: 'Order placed successfully!',
                data: order,
            });
        }

        console.log("❌ Invalid payment method provided:", paymentMethod);
        return res.status(400).json({ message: 'Invalid payment method provided.' });

    } catch (error) {
        console.error("🔥 Error caught in placeOrder:", error);

        if (error.name === 'ValidationError') {
            console.error("⚠️ Mongoose Validation Error Details:", error.message);
            return res.status(400).json({
                success: false,
                message: 'Order validation failed.',
                details: error.message,
            });
        }

        res.status(500).json({ success: false, message: 'Server error while placing order.' });
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
      .populate("vendor", "businessName profileImage") // Get vendor details for display
      .sort({ createdAt: -1 }); // Show the most recent orders first

    res.status(200).json({ success: true, count: orders.length, data: orders });
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
