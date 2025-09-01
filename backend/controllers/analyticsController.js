import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';
import Order from '../models/Order.model.js';

const getBasicAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalVendors = await Vendor.countDocuments();
        const approvedVendors = await Vendor.countDocuments({ approvalStatus: 'approved' });
        // const totalOrders = await Order.countDocuments(); // Placeholder for when you have an Order model

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalVendors,
                approvedVendors,
                pendingVendors: totalVendors - approvedVendors,
                // totalOrders,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Comprehensive Analytics ---
const getComprehensiveAnalytics = async (req, res) => {
    try {
        // 1. Revenue Metrics
        const revenueData = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // 2. Order Status Counts
        const orderStatusCounts = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 3. New User Signups (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersCount = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // 4. Top 5 Vendors by Order Count
        const topVendors = await Order.aggregate([
            { $group: { _id: '$vendor', orderCount: { $sum: 1 } } },
            { $sort: { orderCount: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendorDetails' } },
            { $unwind: '$vendorDetails' },
            { $project: { _id: 0, vendorName: '$vendorDetails.businessName', orderCount: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                orderStatusCounts,
                newUsersLast7Days: newUsersCount,
                topVendors,
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export { getBasicAnalytics, getComprehensiveAnalytics };