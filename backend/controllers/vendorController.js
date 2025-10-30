import Vendor from "../models/Vendor.model.js";
import Order from "../models/Order.model.js";
import { cloudinary } from "../config/cloudinary.js";
import MenuItem, { MenuCategory } from "../models/MenuItem.model.js";

const registerVendor = async (req, res) => {
  // 1. Get ALL the data from the frontend form
  const {
    email,
    password,
    fullName, // From the 'Owner Name' field
    phone, // From the 'Phone' field
    restaurantName, // From the 'Business Name' field
    address, // The single address string
    cuisineType,
  } = req.body;

  // 2. Basic Validation: Check if the most important fields were sent
  if (!email || !password || !restaurantName || !fullName) {
    return res.status(400).json({
      message: "Email, password, owner name, and business name are required.",
    });
  }
  if (
    !req.files ||
    !req.files.businessLicense ||
    !req.files.foodSafetyCertificate
  ) {
    return res.status(400).json({
      message:
        "Both business license and food safety certificate are required.",
    });
  }

  try {
    // JOB 1: CREATE THE FIREBASE USER
    console.log("Attempting to create user in Firebase...");
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName,
    });
    console.log("Firebase user created successfully:", userRecord.uid);

    // JOB 2: CREATE THE USER IN YOUR MONGODB
    const newUser = new User({
      firebaseUid: userRecord.uid,
      email: email,
      name: {
        first: fullName.split(" ")[0] || "",
        last: fullName.split(" ")[1] || "",
      },
      phone: phone,
      // Add default values for other required User fields
      yearOfStudy: "1st Year",
      accommodation: "Non-Hosteller",
    });
    const savedUser = await newUser.save();
    console.log("MongoDB user created successfully:", savedUser._id);

    // JOB 3: CREATE THE VENDOR PROFILE IN MONGODB

    // File Upload Logic (This part is the same)
    const uploadToCloudinary = (file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "unieats_documents" },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({ url: result.secure_url, public_id: result.public_id });
          }
        );
        uploadStream.end(file.buffer);
      });
    };
    const [licenseResult, certificateResult] = await Promise.all([
      uploadToCloudinary(req.files.businessLicense[0]),
      uploadToCloudinary(req.files.foodSafetyCertificate[0]),
    ]);

    // Assemble the new Vendor, matching the frontend's data names
    const newVendor = new Vendor({
      owner: savedUser._id, // Link to the user we just created
      businessName: restaurantName, // Use the name from the form
      contactPhone: phone, // Use the phone from the form
      cuisineType: [cuisineType],
      // Create a simple address object from the single string
      businessAddress: {
        street: address,
        city: "Unknown",
        state: "Unknown",
        zipCode: "000000",
      },
      documents: {
        businessLicense: licenseResult,
        foodSafetyCertificate: certificateResult,
      },
    });

    await newVendor.save();
    console.log("Vendor profile created successfully.");

    res.status(201).json({
      success: true,
      message: "Registration successful! Your application is pending approval.",
    });
  } catch (error) {
    console.error("Error during vendor registration:", error);
    // This will catch errors from Firebase (like 'email-already-exists')
    // and Mongoose (like validation errors)
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({
        message: "This email is already registered. Please login instead.",
      });
    }
    res.status(500).json({ message: "Server error during registration." });
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

// GET all orders for a vendor - Been Worked on.
const getVendorOrders = async (req, res) => {
  try {
    // 1. Find the vendor profile for the logged-in user
    // This is the most important step. We need the vendor's specific ID
    // to ensure we only fetch THEIR orders.
    const vendorProfile = await Vendor.findOne({ owner: req.user._id });
    if (!vendorProfile) {
      return res.status(403).json({
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
      // Map frontend filter values to database status values
      const statusMap = {
        new: "pending",
        delivery: "out_for_delivery",
        accepted: "accepted",
        preparing: "preparing",
        ready: "ready",
        delivered: "delivered",
        rejected: "rejected",
        cancelled: "cancelled",
      };

      const mappedStatus = statusMap[status] || status;
      query.status = mappedStatus;
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
    // Optional 'rejectionReason' from the frontend
    const { status: newStatus, rejectionReason } = req.body;

    // Added Input Validation
    const validStatuses = [
      "accepted",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "rejected",
    ];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    // Security: Find the vendor profile for the logged-in user
    const vendorProfile = await Vendor.findOne({ owner: req.user._id });
    if (!vendorProfile) {
      return res.status(403).json({ message: "Vendor profile not found." });
    }

    const order = await Order.findById(orderId).populate("user", "_id"); // Populate user for notifications
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
      pending: ["accepted", "preparing", "cancelled", "rejected"],
      accepted: ["preparing", "rejected"],
      preparing: ["ready", "cancelled"],
      ready: ["out_for_delivery", "delivered"],
      out_for_delivery: ["delivered"],
      delivered: [], // Cannot change after delivery
      cancelled: [], // Cannot change after cancellation
      rejected: [], // Cannot change after rejection
    };

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(newStatus)
    ) {
      return res.status(400).json({
        message: `Invalid status transition from ${currentStatus} to ${newStatus}.`,
      });
    }

    // Handle the Rejection Reason
    // If the vendor is rejecting (cancelling) the order, we must have a reason.
    if (newStatus === "cancelled" || newStatus === "rejected") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        // Check if reason was provided in the request body
        return res.status(400).json({
          message: "A reason is required for rejecting/cancelling an order.",
        });
      }
      order.rejectionReason = rejectionReason.trim(); // Save the reason to the order
      if (newStatus === "rejected") {
        order.rejectedAt = new Date();
      }
    }

    // Add timestamps for analytics
    if (newStatus === "accepted" && !order.acceptedAt) {
      order.acceptedAt = new Date();
    }
    if (newStatus === "preparing" && !order.acceptedAt) {
      // Fallback: if vendor skips "accepted" and goes straight to "preparing"
      order.acceptedAt = new Date();
    }
    if (newStatus === "ready" && !order.readyAt) {
      order.readyAt = new Date();
    }

    order.status = newStatus;
    // The pre-save hook on the Order model should automatically update the statusHistory array now.

    const updatedOrder = await order.save();

    // set firstDeliveredOrderDate when first order is delivered
    if (newStatus === "delivered" && !vendorProfile.firstDeliveredOrderDate) {
      vendorProfile.firstDeliveredOrderDate = new Date();
      await vendorProfile.save();
    }

    // Add Admin Notification
    const io = req.app.get("socketio");

    // Notify the vendor's own dashboard
    io.to(vendorProfile._id.toString()).emit("order_update", updatedOrder);

    // Notify the user who placed the order
    io.to(order.user._id.toString()).emit("order_update", updatedOrder);

    // Notify any connected admins in the dedicated admin room
    io.to("admin_room").emit("live_order_update", updatedOrder);

    // TRIGGER ANALYTICS UPDATE - Emit event to refresh analytics in real-time
    io.to(vendorProfile._id.toString()).emit("analytics_update", {
      vendorId: vendorProfile._id,
      orderId: updatedOrder._id,
      status: newStatus,
      totalPrice: updatedOrder.totalPrice,
    });

    // Also notify admin analytics
    io.to("admin_room").emit("analytics_update", {
      vendorId: vendorProfile._id,
      orderId: updatedOrder._id,
      status: newStatus,
      totalPrice: updatedOrder.totalPrice,
    });

    res.status(200).json({
      message: "Order status updated successfully!",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    // Add more specific error handling for validation errors during save
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Order validation failed on save.",
        details: error.message,
      });
    }
    res.status(500).json({ message: "Server error while updating status." });
  }
};

//GET VENDOR STATUS
const getVendorStatus = async (req, res) => {
  try {
    const userId = req.user._id; // from verifyFirebaseToken middleware

    // Find the vendor profile for this user
    const vendor = await Vendor.findOne({ owner: userId }).select(
      "approvalStatus"
    ); // fetch only approvalStatus
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
    return res
      .status(500)
      .json({ message: "Server error fetching vendor approval status." });
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
  getVendorStatus,
};
export { registerVendor, getAllVendors, getVendorDetails };
