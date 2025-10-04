import Cart from "../models/Cart.model.js";
import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Vendor from "../models/Vendor.model.js";

// Step 1 - Place Order & Initiate Payment
const placeOrder = async (req, res) => {
  const { addressId } = req.body;
  const userId = req.user._id;
  console.log("evar user-",userId);

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const user = await User.findById(userId);

    let deliveryAddressString = "";
    const accommodationType = user.accommodation
      ? user.accommodation.toLowerCase()
      : "";


    if (accommodationType === "hosteller" && user.hostelDetails) {
      const { block, room } = user.hostelDetails;
      if (block && room) {
        deliveryAddressString = `Block ${block}, Room ${room}`;
      } else {
        return res
          .status(400)
          .json({ message: "Please complete your hostel details in your profile before ordering." });
      }
    } else if (
      accommodationType === "non-hosteller" &&
      Array.isArray(user.addresses) &&
      user.addresses.length > 0
    ) {
      const defaultAddress =
        user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
      if (defaultAddress.street && defaultAddress.city && defaultAddress.state && defaultAddress.zipCode) {
        deliveryAddressString = `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.zipCode}`;
        if (defaultAddress.landmark) {
          deliveryAddressString += `, near ${defaultAddress.landmark}`;
        }
      } else {
        return res.status(400).json({
          message:
            "Please complete all fields of your address before ordering.",
        });
      }
    } else {
      return res.status(400).json({
        message:
          "Please complete your address details in your profile before ordering.",
      });
    }
    const vendor = await Vendor.findById(cart.vendor);
    if (!vendor || !vendor.upiId) {
      return res
        .status(400)
        .json({ message: "This vendor is not currently accepting payments." });
    }

    const order = new Order({
      user: userId,
      vendor: cart.vendor,
      items: cart.items,
      totalAmount: cart.total,
      deliveryAddress: deliveryAddressString,
      status: "payment_pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed. Please complete the payment.",
      data: {
        orderId: order._id,
        amount: order.totalAmount,
        upiId: vendor.upiId,
      },
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
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
