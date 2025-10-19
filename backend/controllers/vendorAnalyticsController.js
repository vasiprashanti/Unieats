import Order from '../models/Order.model.js';
import Vendor from '../models/Vendor.model.js';
import mongoose from 'mongoose';

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
            dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // The Base Query for all pipelines
        const baseMatch = {
            vendor: vendorProfile._id,
            status: 'delivered',
            ...dateFilter // Apply the date filter
        };

        // Pipeline 1: Calculate Summary Stats
        const summaryPipeline = [
            { $match: baseMatch },
            { $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' }, // Use totalPrice to match Order model
                totalOrders: { $sum: 1 },
                avgOrderValue: { $avg: '$totalPrice' },
                avgPrepTime: { $avg: { $divide: [{ $subtract: ["$readyAt", "$acceptedAt"] }, 60000] } }
            }}
        ];

        // Pipeline 2: Calculate Revenue Data for Chart
        const revenueChartPipeline = [
            { $match: baseMatch },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: '$totalPrice' }
            }},
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: '$_id', revenue: 1 } }
        ];

        // Pipeline 3: Calculate Top Selling Items
        const topItemsPipeline = [
            { $match: baseMatch },
            { $unwind: '$items' }, // Deconstruct the items array
            { $group: {
                _id: '$items.menuItem',
                name: { $first: '$items.name' },
                orders: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }},
            { $sort: { orders: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, name: 1, orders: 1, revenue: 1 } }
        ];

        // Execute all queries in parallel for performance
        const [summaryResult, revenueData, topItems] = await Promise.all([
            Order.aggregate(summaryPipeline),
            Order.aggregate(revenueChartPipeline),
            Order.aggregate(topItemsPipeline)
        ]);

        // Assemble the Final Report
        const summary = summaryResult[0] || {};
        const finalReport = {
            summary: {
                totalRevenue: summary.totalRevenue || 0,
                totalOrders: summary.totalOrders || 0,
                avgOrderValue: summary.avgOrderValue || 0,
                avgPrepTime: summary.avgPrepTime || 0,
                // These are placeholders as we aren't calculating period-over-period changes yet
                revenueChange: 0, 
                ordersChange: 0,
                avgOrderValueChange: 0,
                avgPrepTimeChange: 0
            },
            revenueData: revenueData,
            topItems: topItems
        };
        
        res.status(200).json({ success: true, data: finalReport });

    } catch (error) {
        console.error("Error fetching vendor analytics:", error);
        res.status(500).json({ message: "Server error while fetching analytics." });
    }
};

export { getVendorAnalytics };

