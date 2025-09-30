import Vendor from "../models/Vendor.model.js";
import MenuItem, { MenuCategory } from "../models/MenuItem.model.js";
import { cloudinary } from "../config/cloudinary.js";

const registerVendor = async (req, res) => {
  // The user must be logged in to register as a vendor
  const ownerId = req.user._id;

  try {
    // Check if user already owns a vendor profile
    const existingVendor = await Vendor.findOne({ owner: ownerId });
    if (existingVendor) {
      return res
        .status(400)
        .json({ message: "You have already registered a vendor profile." });
    }

    // Handle file uploads to Cloudinary
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

    const newVendor = new Vendor({
      ...req.body,
      owner: ownerId,
      documents: {
        businessLicense: licenseResult,
        foodSafetyCertificate: certificateResult,
      },
    });

    await newVendor.save();

    res.status(201).json({
      success: true,
      message:
        "Vendor registration successful! Your application is pending approval.",
      data: newVendor,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error during vendor registration." });
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

export { registerVendor, getAllVendors, getVendorDetails };
