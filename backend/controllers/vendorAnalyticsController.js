import Order from "../models/Order.model.js";
import Vendor from "../models/Vendor.model.js";
import mongoose from "mongoose";

const getVendorAnalytics = async (req, res) => {
  try {
    // 1. SECURITY & SETUP
    // First, find the vendor profile for the logged-in user. We need their
    // specific _id for the query and their commissionRate for the final calculation.
    const vendorProfile = await Vendor.findOne({ owner: req.user._id });
    if (!vendorProfile) {
      return res
        .status(403)
        .json({
          message:
            "Vendor profile not found. You are not authorized to view analytics.",
        });
    }

    // 2. THE AGGREGATION PIPELINE (The "Database Accountant")
    // This is a series of stages that the data will pass through.
    const pipeline = [
      // STAGE 1: The Filter ($match)
      // Tell the accountant to only look at "delivered" orders for THIS specific vendor.
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(vendorProfile._id),
          status: "delivered",
        },
      },

      // STAGE 2: The Calculation Field ($project)
      // Before we group, we need to calculate the prep time for EACH order.
      // This stage creates a temporary new field for our calculation.
      {
        $project: {
          totalAmount: 1, // Pass through the totalAmount for the next stage
          rating: 1, // Pass through the rating
          prepTimeInMinutes: {
            // Subtract the 'acceptedAt' time from the 'readyAt' time.
            // This gives the duration in milliseconds.
            $divide: [
              { $subtract: ["$readyAt", "$acceptedAt"] },
              60000, // Divide by 60,000 to convert from milliseconds to minutes
            ],
          },
        },
      },

      // STAGE 3: The Summary Report ($group)
      // Now, group all the documents that passed the filter into a single report.
      {
        $group: {
          _id: null, // Group ALL found documents into one result
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 }, // Count the number of orders
          averageRating: { $avg: "$rating" },
          averagePrepTime: { $avg: "$prepTimeInMinutes" }, // Get the average of our calculated field
        },
      },
    ];

    // Execute the aggregation pipeline
    const analyticsResult = await Order.aggregate(pipeline);

    // 3. FINAL CALCULATIONS (in JavaScript)
    let report = {
      totalRevenue: 0,
      platformCommission: 0,
      vendorEarnings: 0,
      totalOrders: 0,
      averageRating: 0,
      averagePrepTime: 0,
    };

    // The result is an array; if it has data, the first element is our report.
    if (analyticsResult.length > 0) {
      const result = analyticsResult[0];
      const totalRevenue = result.totalRevenue;
      const platformCommission = totalRevenue * vendorProfile.commissionRate;

      report = {
        totalRevenue: totalRevenue.toFixed(2),
        platformCommission: platformCommission.toFixed(2),
        vendorEarnings: (totalRevenue - platformCommission).toFixed(2),
        totalOrders: result.totalOrders,
        averageRating: result.averageRating
          ? result.averageRating.toFixed(2)
          : 0,
        averagePrepTime: result.averagePrepTime
          ? result.averagePrepTime.toFixed(2)
          : 0,
      };
    }

    // 4. SEND THE RESPONSE
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Error fetching vendor analytics:", error);
    res.status(500).json({ message: "Server error while fetching analytics." });
  }
};

export { getVendorAnalytics };
