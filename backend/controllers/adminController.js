import Vendor from '../models/Vendor.model.js';
import User from '../models/User.model.js';
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '../utils/emailService.js';

const getAdminDashboard = (req, res) => {
    res.status(200).json({
        success: true,
        message: `Welcome to the admin dashboard, ${req.user.name}!`,
    });
};

// Get All Vendors
const getVendors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const vendors = await Vendor.find()
            .populate('owner', 'name email') // Populate owner details
            .skip(skip)
            .limit(limit);
        
        const totalVendors = await Vendor.countDocuments();

        res.status(200).json({
            success: true,
            count: vendors.length,
            totalPages: Math.ceil(totalVendors / limit),
            currentPage: page,
            data: vendors,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update Vendor Approval Status
const updateVendorApproval = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found.' });
        }
        
        // Find the owner to update their role and get their email
        const vendorOwner = await User.findById(vendor.owner);
        if (!vendorOwner) {
            return res.status(404).json({ success: false, message: 'Vendor owner account not found.' });
        }

        vendor.approvalStatus = status;
        
        if (status === 'approved') {
            // Promote user role to 'vendor'
            vendorOwner.role = 'vendor';
            await vendorOwner.save();
            await vendor.save();
            // Send approval email
            await sendVendorApprovalEmail(vendorOwner.email, vendorOwner.name);
        } else {
            // If rejected, just save the vendor status
            await vendor.save();
            // Send rejection email
            await sendVendorRejectionEmail(vendorOwner.email, vendorOwner.name);
        }

        res.status(200).json({
            success: true,
            message: `Vendor has been ${status}.`,
            data: vendor,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export { getAdminDashboard, getVendors, updateVendorApproval };