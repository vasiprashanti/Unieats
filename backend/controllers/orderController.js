import Order from "../models/Order.model.js";
import { Parser } from "json2csv";

// --- Real-Time Order Monitoring ---
const monitorRealTimeOrders = async (req, res) => {
  try {
    // Fetch recent orders (e.g., last 24 hours) that are not yet delivered or cancelled
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeStatuses = [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "out_for_delivery",
    ];

    const recentOrders = await Order.find({
      createdAt: { $gte: twentyFourHoursAgo },
      status: { $in: activeStatuses },
    })
      .populate("user", "name")
      .populate("vendor", "businessName")
      .sort({ createdAt: -1 }) // Show newest first
      .limit(50); // Limit to 50 recent orders

    res.status(200).json({ success: true, data: recentOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- CSV Export Functionality ---
const exportOrdersToCSV = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("vendor", "businessName")
      .lean(); // Use .lean() for faster query, as we don't need Mongoose documents

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found to export." });
    }

    // Flatten the data for CSV
    const flattenedOrders = orders.map((order) => ({
      orderId: order._id,
      userName: order.user.name,
      userEmail: order.user.email,
      vendorName: order.vendor.businessName,
      totalPrice: order.totalPrice,
      status: order.status,
      date: order.createdAt.toISOString().split("T")[0],
      itemCount: order.items.length,
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(flattenedOrders);

    res.header("Content-Type", "text/csv");
    res.attachment(`unieats-orders-${new Date().toISOString()}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { monitorRealTimeOrders, exportOrdersToCSV };
