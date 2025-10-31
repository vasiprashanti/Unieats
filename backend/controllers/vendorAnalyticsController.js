import Order from "../models/Order.model.js";
import Vendor from "../models/Vendor.model.js";
import mongoose from "mongoose";

const getVendorAnalytics = async (req, res) => {
  try {
    const vendorProfile = await Vendor.findOne({ owner: req.user._id });
    if (!vendorProfile) {
      return res.status(403).json({ message: "Vendor profile not found." });
    }

    // Handle Date Range Filtering
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // The Base Query for all pipelines
    const baseMatch = {
      vendor: vendorProfile._id,
      status: "delivered",
      ...dateFilter, // Apply the date filter
    };

    // Pipeline 1: Calculate Summary Stats with Fee Breakdown
    const summaryPipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalPrice" },
          // Mode 1 (COD/UPI): Money vendor owes to UniEats (platform fee + commission)
          amountVendorOwesToUnieats: { $sum: "$vendorOwes" },
          // Mode 2 (Razorpay): Money UniEats owes to vendor (payout amount)
          amountUnieatsOwesToVendor: { $sum: "$vendorPayout" },
          avgPrepTime: {
            $avg: {
              $cond: {
                if: { $and: ["$readyAt", "$acceptedAt"] },
                then: {
                  $divide: [{ $subtract: ["$readyAt", "$acceptedAt"] }, 60000],
                },
                else: null,
              },
            },
          },
        },
      },
    ];

    // Pipeline 2: Calculate Revenue Data for Chart
    const revenueChartPipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1 } },
    ];

    // Pipeline 3: Calculate Top Selling Items
    const topItemsPipeline = [
      { $match: baseMatch },
      { $unwind: "$items" }, // Deconstruct the items array
      {
        $group: {
          _id: "$items.menuItem",
          name: { $first: "$items.name" },
          orders: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { orders: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: 1, orders: 1, revenue: 1 } },
    ];

    // Execute all queries in parallel for performance
    const [summaryResult, revenueData, topItems] = await Promise.all([
      Order.aggregate(summaryPipeline),
      Order.aggregate(revenueChartPipeline),
      Order.aggregate(topItemsPipeline),
    ]);

    // Assemble the Final Report
    const summary = summaryResult[0] || {};

    const totalRevenue = summary.totalRevenue || 0;
    const amountVendorOwesToUnieats = summary.amountVendorOwesToUnieats || 0;
    const amountUnieatsOwesToVendor = summary.amountUnieatsOwesToVendor || 0;

    // Calculate net balance: positive means vendor owes UniEats, negative means UniEats owes vendor
    const netBalance = amountVendorOwesToUnieats - amountUnieatsOwesToVendor;

    // trial status
    const isTrialActive = vendorProfile.isTrialActive();
    const trialDaysRemaining = isTrialActive
      ? vendorProfile.getTrialDaysRemaining()
      : 0;
    const trialEndDate = vendorProfile.getTrialEndDate();

    const finalReport = {
      totalRevenue,
      // Bidirectional financial tracking
      amountVendorOwesToUnieats, // From COD/UPI orders
      amountUnieatsOwesToVendor, // From Razorpay orders (payouts)
      netBalance, // Positive = vendor owes UniEats, Negative = UniEats owes vendor
      totalOrders: summary.totalOrders || 0,
      averagePrepTime: summary.avgPrepTime || 0,
      revenueData: revenueData,
      topItems: topItems,
      trialStatus: {
        isActive: isTrialActive,
        daysRemaining: trialDaysRemaining,
        endDate: trialEndDate,
      },
    };

    res.status(200).json(finalReport);
  } catch (error) {
    console.error("Error fetching vendor analytics:", error);
    res.status(500).json({ message: "Server error while fetching analytics." });
  }
};

export { getVendorAnalytics };
