import Vendor from "../models/Vendor.model.js";
import User from "../models/User.model.js";
import {
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
} from "../utils/emailService.js";

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
      .populate("owner", "name email") // Populate owner details
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
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Vendor Approval Status
const updateVendorApproval = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    // Fetch the vendor
    const vendor = await Vendor.findById(req.params.id).select("owner");
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });
    }

    // Fetch vendor owner email and name
    const vendorOwner = await User.findById(vendor.owner).select("email name");
    if (!vendorOwner) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor owner account not found." });
    }

    // Update vendor approval status
    await Vendor.findByIdAndUpdate(vendor._id, { approvalStatus: status });

    // If approved, update vendor owner role
    if (status === "approved") {
      await User.findByIdAndUpdate(vendor.owner, { role: "vendor" });
    }

    // Try sending email, but don't block response if it fails
    try {
      if (status === "approved") {
        await sendVendorApprovalEmail(vendorOwner.email, vendorOwner.name);
      } else {
        await sendVendorRejectionEmail(vendorOwner.email, vendorOwner.name);
      }
    } catch (emailError) {
      // Optionally log the email error for debugging, but don't fail the request
      console.error("Email sending failed:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `Vendor has been ${status}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




export { getAdminDashboard, getVendors, updateVendorApproval };
