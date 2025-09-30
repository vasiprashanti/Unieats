import Order from "../models/Order.model.js";
import MenuItem from "../models/MenuItem.model.js";
import { Parser } from "json2csv";

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
export { rateOrderItems };
