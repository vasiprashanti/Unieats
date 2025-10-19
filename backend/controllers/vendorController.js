import Vendor from "../models/Vendor.model.js";
import Order from "../models/Order.model.js";
import { cloudinary } from "../config/cloudinary.js";
import MenuItem, { MenuCategory } from "../models/MenuItem.model.js";

import User from "../models/User.model.js";



// Helper to convert buffer to Base64 Data URI
const bufferToDataURI = (file) => {
  const base64 = file.buffer.toString("base64");
  const mimeType = file.mimetype;
  return `data:${mimeType};base64,${base64}`;
};


const registerVendor = async (req, res) => {
  try {
    console.log("📌 [registerVendor] Vendor registration API hit.");
    console.log("Data received:", req.body);

    const cuisineType = JSON.parse(req.body.cuisineType);
    const operatingHours = JSON.parse(req.body.operatingHours);

    if (!req.files || !req.files.businessLicense || !req.files.foodSafetyCertificate) {
      return res.status(400).json({ message: "Both Business License and Food Safety Certificate are required." });
    }

    const businessLicenseFile = req.files.businessLicense[0];
    const foodSafetyCertificateFile = req.files.foodSafetyCertificate[0];

    console.log("➡️ Uploading files to Cloudinary...");

    // Upload Business License
    const licenseResult = await cloudinary.uploader.upload(
      bufferToDataURI(businessLicenseFile),
      { folder: "unieats_documents" }
    );

    // Upload Food Safety Certificate
    const certificateResult = await cloudinary.uploader.upload(
      bufferToDataURI(foodSafetyCertificateFile),
      { folder: "unieats_documents" }
    );

    console.log("✅ Files uploaded successfully.");

    // Find the user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User with this email not found." });
    }

    const vendorData = {
      businessName: req.body.businessName,
      contactPhone: req.body.phone,
      businessAddress: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode
      },
      cuisineType,
      operatingHours,
      businessLicense: {
        url: licenseResult.secure_url,
        public_id: licenseResult.public_id
      },
      foodSafetyCertificate: {
        url: certificateResult.secure_url,
        public_id: certificateResult.public_id
      },
      owner: user._id // attach the found user's id here
    };

    const vendor = new Vendor(vendorData);
    await vendor.save();

    console.log("✅ Vendor registered successfully:", vendor._id);
    res.status(201).json({ success: true, vendor });

  } catch (error) {
    console.error("💥 ERROR in registerVendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const getVendorProfile = async (req, res) => {
  // The user must be logged in to register as a vendor
  const ownerId = req.user._id;

  try {
    const vendor = await Vendor.findOne({ owner: ownerId });

    if (!vendor) {
      res.status(404).json({ message: "Vendor profile not found" });
    }
    res.status(200).json({
      message: "Vendor profile retrieved successfully!",
      vendor: vendor, // Send the actual vendor data back
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching vendor profile." });
  }
};

const updateVendorProfile = async (req, res) => {
  try {
    const vendorProfile = await Vendor.findOne({ owner: req.user._id });
    if (!vendorProfile) {
      return res.status(404).json({ message: "Vendor profile not found." });
    }

    const { operatingHours, ...otherUpdates } = req.body;

    // Handle simple field updates
    Object.assign(vendorProfile, otherUpdates);

    if (operatingHours && Array.isArray(operatingHours)) {
      vendorProfile.operatingHours = operatingHours;
    }

    // Note: Document upload/update would be a separate, more complex endpoint
    // e.g., POST /vendors/documents, DELETE /vendors/documents/:docId

    const updatedVendor = await vendorProfile.save();
    res
      .status(200)
      .json({ message: "Profile updated!", vendor: updatedVendor });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
};

// GET all orders for a vendor, with advanced filtering
const getVendorOrders = async (req, res) => {
  try {
    // 1. SECURITY: Find the vendor profile for the logged-in user
    // This is the most important step. We need the vendor's specific ID
    // to ensure we only fetch THEIR orders.
    const vendorProfile = await Vendor.findOne({ owner: req.user._id });
    if (!vendorProfile) {
      return res
        .status(403)
        .json({
          message:
            "Vendor profile not found. You are not authorized to view orders.",
        });
    }

    // 2. FILTERING LOGIC: Build a dynamic query object
    // We start with the base security filter: only find orders for this vendor.
    const query = { vendor: vendorProfile._id };

    // Now, we check for optional filters from the URL (req.query)
    // Example: /orders?status=pending
    const { status, date } = req.query;

    if (status) {
      query.status = status;
    }

    // Example date filter: /orders?date=2025-10-03
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1); // Get all orders from the start of the day to the end
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    // 3. EXECUTE THE QUERY
    // We use our dynamically built 'query' object to find the matching orders.
    const orders = await Order.find(query)
      .populate("user", "name") // Pull in the customer's name for display
      .sort({ createdAt: -1 }); // Show the newest orders first

    // 4. SEND THE RESPONSE
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status: newStatus } = req.body;

    // Security: Find the vendor profile for the logged-in user
    const vendorProfile = await Vendor.findOne({ owner: req.user._id });
    if (!vendorProfile) {
      return res.status(403).json({ message: "Vendor profile not found." });
    }

    const order = await Order.findById(orderId).populate("user", "_id");
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // CRITICAL Security Check: Ensure the order belongs to the logged-in vendor
    if (order.vendor.toString() !== vendorProfile._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this order." });
    }

    // Order Status Transition Validation (State Machine)
    const currentStatus = order.status;
    const allowedTransitions = {
      // Allow vendor to accept an order from pending, then move to preparing
      // Also allow rejecting at early stages
      pending: ["accepted", "preparing", "cancelled", "rejected"],
      accepted: ["preparing", "cancelled", "rejected"],
      preparing: ["ready", "cancelled", "rejected"],
      ready: ["out_for_delivery", "delivered"],
      out_for_delivery: ["delivered"],
      delivered: [], // Cannot change after delivery
      cancelled: [], // Cannot change after cancellation
    };

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(newStatus)
    ) {
      return res
        .status(400)
        .json({
          message: `Invalid status transition from ${currentStatus} to ${newStatus}.`,
        });
    }

  order.status = newStatus;
  if (newStatus === 'accepted') order.acceptedAt = new Date();
  if (newStatus === 'ready') order.readyAt = new Date();
  if (newStatus === 'rejected') order.rejectedAt = new Date();
    // The pre-save hook on the Order model will automatically update the statusHistory

    const updatedOrder = await order.save();

    // Socket.io Broadcasting for Status Changes
    const io = req.app.get("socketio");
    // Notify the vendor's own dashboard
    io.to(vendorProfile._id.toString()).emit("order_update", updatedOrder);
    // Notify the user who placed the order
    io.to(order.user._id.toString()).emit("order_update", updatedOrder);

    res
      .status(200)
      .json({
        message: "Order status updated successfully!",
        order: updatedOrder,
      });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error while updating status." });
  }
};

//GET VENDOR STATUS
const getVendorStatus = async (req, res) => {
  try {
    const userId = req.user._id; // from verifyFirebaseToken middleware

    // Find the vendor profile for this user
    const vendor = await Vendor.findOne({ owner: userId }).select("approvalStatus"); // fetch only approvalStatus
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found." });
    }

    // Send response with approvalStatus
    return res.status(200).json({
      success: true,
      status: vendor.approvalStatus, // send approvalStatus
    });
  } catch (error) {
    console.error("Error fetching vendor approval status:", error);
    return res.status(500).json({ message: "Server error fetching vendor approval status." });
  }
};


// GET all vendors (restaurants)
const getAllVendors = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { approvalStatus: "approved" };
    if (search) {
      query.$text = { $search: search };
    }

    // Find vendors with optional text search
    const vendors = await Vendor.find(query)
      .skip(skip)
      .limit(Number(limit))
      .select("businessName businessAddress cuisineType phone operatingHours")
      .lean();

    const totalVendors = await Vendor.countDocuments(query);

    res.status(200).json({
      success: true,
      count: vendors.length,
      totalPages: Math.ceil(totalVendors / limit),
      currentPage: Number(page),
      data: vendors,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// GET vendor (restaurant) details + menu
const getVendorDetails = async (req, res) => {
  try {
    const vendorId = req.params.id;
    // Find vendor by ID
    const vendor = await Vendor.findById(vendorId).select("-documents");
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });
    }

    // Get menu categories for this vendor
    const categories = await MenuCategory.find({
      vendor: vendor._id,
      isActive: true,
    })
      .select("_id name")
      .lean();

    // Get menu items for this vendor
    const menuItems = await MenuItem.find({
      vendor: vendor._id,
      isAvailable: true,
    })
      .select(
        "_id name description price image category isAvailable averageRating"
      )
      .lean();

    // Group menu items by category
    const itemsByCategory = {};
    categories.forEach((cat) => {
      itemsByCategory[cat._id] = [];
    });
    menuItems.forEach((item) => {
      if (item.category && itemsByCategory[item.category]) {
        itemsByCategory[item.category].push(item);
      }
    });

    // Attach items to categories
    const menu = categories.map((cat) => ({
      ...cat,
      items: itemsByCategory[cat._id] || [],
    }));

    res.status(200).json({
      success: true,
      data: {
        vendor,
        menu,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor details:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export {
  updateVendorProfile,
  getVendorProfile,
  updateOrderStatus,
  getVendorOrders,
  getVendorStatus
};
export { registerVendor, getAllVendors, getVendorDetails };
