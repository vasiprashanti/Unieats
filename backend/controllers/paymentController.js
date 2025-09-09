import Order from '../models/Order.model.js';
import Vendor from '../models/Vendor.model.js';
import Payout from '../models/Payment.model.js';
import mongoose from 'mongoose';

const getPayoutHistory = async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) { return res.status(403).json({ message: "Vendor profile not found." }); }

        const history = await Payout.find({ vendor: vendorProfile._id }).sort({ createdAt: -1 });
        res.status(200).json({ history });

    } catch (error) {
        console.error("Error fetching payout history:", error);
        res.status(500).json({ message: "Server error while fetching history." });
    }
};

const calculateCurrentPayout = async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) { return res.status(403).json({ message: "Vendor profile not found." }); }

        // Find the date of the last successful payout
        const lastPayout = await Payout.findOne({ vendor: vendorProfile._id, status: 'paid' }).sort({ periodEndDate: -1 });
        const startDate = lastPayout ? lastPayout.periodEndDate : vendorProfile.createdAt; // Start from last payout or vendor creation date

        const pipeline = [
            {
                $match: {
                    vendor: new mongoose.Types.ObjectId(vendorProfile._id),
                    status: 'delivered',
                    createdAt: { $gte: startDate } // Only orders since the last payout
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ];

        const result = await Order.aggregate(pipeline);
        const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
        
        const platformCommission = totalRevenue * vendorProfile.commissionRate;
        const payoutAmount = totalRevenue - platformCommission;

        res.status(200).json({
            payoutAmount: payoutAmount.toFixed(2),
            totalRevenue: totalRevenue.toFixed(2),
            platformCommission: platformCommission.toFixed(2),
            periodStartDate: startDate.toISOString(),
            periodEndDate: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error calculating current payout:", error);
        res.status(500).json({ message: "Server error while calculating payout." });
    }
};

export { getPayoutHistory, calculateCurrentPayout };