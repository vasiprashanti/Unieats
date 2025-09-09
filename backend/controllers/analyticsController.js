import Order from '../models/Order.model.js';
import Vendor from '../models/Vendor.model.js';
import mongoose from 'mongoose';

const getVendorAnalytics = async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) {
            return res.status(403).json({ message: "Vendor profile not found." });
        }

        const pipeline = [
            {
                $match: {
                    vendor: new mongoose.Types.ObjectId(vendorProfile._id),
                    status: 'delivered',
                    acceptedAt: { $exists: true },
                    readyAt: { $exists: true }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    averagePrepTimeInMillis: { 
                        $avg: { $subtract: ['$readyAt', '$acceptedAt'] } 
                    }
                }
            }
        ];

        const analyticsResult = await Order.aggregate(pipeline);
        
        const data = analyticsResult[0] || { 
            totalRevenue: 0, totalOrders: 0, averageRating: 0, averagePrepTimeInMillis: 0 
        };
        
        const platformCommission = data.totalRevenue * vendorProfile.commissionRate;
        const vendorEarnings = data.totalRevenue - platformCommission;
        const averagePrepTimeInMinutes = data.averagePrepTimeInMillis / (1000 * 60);

        const report = {
            totalRevenue: data.totalRevenue.toFixed(2),
            totalOrders: data.totalOrders,
            averageRating: data.averageRating ? data.averageRating.toFixed(2) : 'N/A',
            averagePrepTimeInMinutes: averagePrepTimeInMinutes.toFixed(2),
            platformCommission: platformCommission.toFixed(2),
            vendorEarnings: vendorEarnings.toFixed(2),
        };

        res.status(200).json({ analytics: report });

    } catch (error) {
        console.error("Error fetching vendor analytics:", error);
        res.status(500).json({ message: "Server error while fetching analytics." });
    }
};

export { getVendorAnalytics };
