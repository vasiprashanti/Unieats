import Order from "../models/Order.model.js";
import Vendor from "../models/Vendor.model.js";
import { MenuItem } from "../models/MenuItem.model.js";

// Place a new order with COD or UPI payment on delivery
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      vendorId,
      items,
      deliveryAddress,
      paymentMethod, // "cod" or "upi" - both handled by delivery agent
      totalPrice,
    } = req.body;

    // Basic validation
    if (
      !vendorId ||
      !items ||
      !deliveryAddress ||
      !paymentMethod ||
      !totalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!["cod", "upi"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be either 'cod' or 'upi'",
      });
    }

    // Verify vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Validate menu items availability
    const menuItemIds = items.map((item) => item.menuItem);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      vendor: vendorId,
    });

    // Check if all items exist and belong to the vendor
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some menu items not found or don't belong to this vendor",
      });
    }

    // Check if all items are available
    const unavailableItems = menuItems.filter((item) => !item.isAvailable);
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some items are no longer available",
        unavailableItems: unavailableItems.map((item) => ({
          menuItem: item._id,
          name: item.name,
        })),
      });
    }

    // Create the order - payment will be handled on delivery
    const newOrder = new Order({
      user: userId,
      vendor: vendorId,
      items,
      totalPrice,
      deliveryAddress,
      status: "pending",
      paymentDetails: {
        method: paymentMethod,
        status: "pending",
      },
    });

    await newOrder.save();
    await newOrder.populate("vendor", "businessName");

    res.status(201).json({
      success: true,
      message: `Order placed! ${paymentMethod.toUpperCase()} payment will be collected on delivery.`,
      data: {
        orderId: newOrder._id,
        vendor: newOrder.vendor.businessName,
        totalPrice: newOrder.totalPrice,
        paymentMethod: paymentMethod.toUpperCase(),
        status: newOrder.status,
      },
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

// Confirm payment received by delivery agent
const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { agentName } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment as confirmed
    order.paymentDetails.status = "confirmed";
    order.paymentDetails.confirmedBy = agentName || req.user.name;
    order.paymentDetails.confirmedAt = new Date();
    order.status = "delivered";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment confirmed! Order delivered.",
      data: {
        orderId: order._id,
        paymentMethod: order.paymentDetails.method.toUpperCase(),
        confirmedBy: order.paymentDetails.confirmedBy,
      },
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
    });
  }
};

// Vendor confirms order (changes status from pending to accepted)
const vendorConfirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const vendorUserId = req.user._id;

    const order = await Order.findById(orderId).populate("vendor");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only allow confirmation if order is pending
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm order. Current status: ${order.status}`,
      });
    }

    // Update order status to accepted
    order.status = "accepted";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed successfully!",
      data: {
        orderId: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentDetails.method.toUpperCase(),
        itemCount: order.items.length,
      },
    });
  } catch (error) {
    console.error("Vendor order confirmation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm order",
    });
  }
};

export { placeOrder, confirmPayment, vendorConfirmOrder };
