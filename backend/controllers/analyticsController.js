import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
// import Order from '../models/Order.js'; // You will create this model later

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

export { getBasicAnalytics };