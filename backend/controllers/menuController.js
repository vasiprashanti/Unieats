import Vendor from "../models/Vendor.model.js";
import { MenuItem, MenuCategory } from "../models/MenuItem.model.js";
import { cloudinary } from "../config/cloudinary.js";

// Helper function to get vendor
const getVendor = async (userId) => {
  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor;
};

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "unieats_menu_items",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    uploadStream.end(file.buffer);
  });
};

// GET vendor's complete menu (categories + items)
const getVendorMenu = async (req, res) => {
  try {
    const vendor = await getVendor(req.user._id);

    // Get categories with item counts
    const categories = await MenuCategory.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "category",
          as: "items",
        },
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          isActive: 1,
          itemCount: { $size: "$items" },
        },
      },
      { $sort: { name: 1 } },
    ]);

    // Get menu items
    const menuItems = await MenuItem.find({ vendor: vendor._id })
      .populate("category", "name")
      .sort({ name: 1 });

    const items = menuItems.map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image?.url || null,
      categoryId: item.category._id,
      category: item.category.name,
      isAvailable: item.isAvailable,
      vegOrNonVeg: item.vegOrNonVeg,
      prepTime: item.prepTime,
      tags: item.tags || [],
    }));

    const stats = {
      totalItems: items.length,
      totalCategories: categories.length,
      availableItems: items.filter((item) => item.isAvailable).length,
    };

    res.json({ categories, items, stats });
  } catch (error) {
    console.error("Error fetching vendor menu:", error);
    res
      .status(error.message === "Vendor profile not found" ? 404 : 500)
      .json({ message: error.message || "Server error" });
  }
};

// CREATE category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const vendor = await getVendor(req.user._id);

    const category = new MenuCategory({
      vendor: vendor._id,
      name: name.trim(),
    });

    await category.save();
    res.status(201).json({
      id: category._id,
      name: category.name,
      isActive: category.isActive,
      itemCount: 0,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    console.error("Error creating category:", error);
    res
      .status(error.message === "Vendor profile not found" ? 404 : 500)
      .json({ message: error.message || "Server error" });
  }
};

// CREATE menu item
const createMenuItem = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const {
      name,
      description,
      price,
      categoryId,
      vegOrNonVeg,
      prepTime,
      tags,
      isVegetarian,
    } = req.body;

    console.log("Extracted fields:", {
      name,
      description,
      price,
      categoryId,
      vegOrNonVeg,
      prepTime,
      tags,
      isVegetarian,
    });

    // Validate required fields
    if (!name || !price || !categoryId) {
      console.log("Validation failed: Missing required fields");
      return res
        .status(400)
        .json({ message: "Name, price, and category are required" });
    }

    const vendor = await getVendor(req.user._id);
    console.log("Vendor found:", vendor);

    // Verify category belongs to this vendor
    const category = await MenuCategory.findOne({
      _id: categoryId,
      vendor: vendor._id,
    });
    console.log("Category found:", category);

    if (!category) {
      console.log("Invalid category for vendor");
      return res.status(400).json({ message: "Invalid category" });
    }

    // Handle image upload
    let imageData = null;
    if (req.file) {
      console.log("Uploading image...");
      imageData = await uploadImageToCloudinary(req.file);
      console.log("Image uploaded:", imageData);
    }

    const menuItem = new MenuItem({
      vendor: vendor._id,
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      image: imageData,
      category: categoryId,
      vegOrNonVeg: isVegetarian ? "veg" : vegOrNonVeg || "nonveg",
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      tags: Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(",").map((t) => t.trim())
        : [],
    });

    console.log("Menu item object before save:", menuItem);

    await menuItem.save();
    await menuItem.populate("category", "name");
    console.log("Menu item saved and populated:", menuItem);

    const responseItem = {
      id: menuItem._id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      image: menuItem.image?.url || null,
      categoryId: menuItem.category._id,
      category: menuItem.category.name,
      isAvailable: menuItem.isAvailable,
      vegOrNonVeg: menuItem.vegOrNonVeg,
      prepTime: menuItem.prepTime,
      tags: menuItem.tags,
    };

    console.log("Response item:", responseItem);

    res.status(201).json(responseItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    res
      .status(error.message === "Vendor profile not found" ? 404 : 500)
      .json({ message: error.message || "Server error" });
  }
};

// UPDATE menu item
const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const id = itemId;

    const {
      name,
      description,
      price,
      categoryId,
      vegOrNonVeg,
      prepTime,
      tags,
      isVegetarian,
    } = req.body;

    const vendor = await getVendor(req.user._id);

    const menuItem = await MenuItem.findOne({ _id: id, vendor: vendor._id });
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (categoryId) {
      const category = await MenuCategory.findOne({
        _id: categoryId,
        vendor: vendor._id,
      });
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    let imageData = menuItem.image;
    if (req.file) {
      if (menuItem.image?.public_id) {
        await cloudinary.uploader
          .destroy(menuItem.image.public_id)
          .catch(console.error);
      }
      imageData = await uploadImageToCloudinary(req.file);
    }

    if (name) menuItem.name = name.trim();
    if (description !== undefined) menuItem.description = description?.trim();
    if (price) menuItem.price = parseFloat(price);
    if (categoryId) menuItem.category = categoryId;
    if (prepTime) menuItem.prepTime = parseInt(prepTime);

    if (vegOrNonVeg || isVegetarian !== undefined) {
      menuItem.vegOrNonVeg = isVegetarian
        ? "veg"
        : vegOrNonVeg || menuItem.vegOrNonVeg;
    }

    if (tags !== undefined) {
      menuItem.tags = Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(",").map((t) => t.trim())
        : [];
    }

    menuItem.image = imageData;

    await menuItem.save();
    await menuItem.populate("category", "name");

    const responseItem = {
      id: menuItem._id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      image: menuItem.image?.url || null,
      categoryId: menuItem.category._id,
      category: menuItem.category.name,
      isAvailable: menuItem.isAvailable,
      vegOrNonVeg: menuItem.vegOrNonVeg,
      prepTime: menuItem.prepTime,
      tags: menuItem.tags,
    };

    return res.status(200).json(responseItem);
  } catch (error) {
    res
      .status(error.message === "Vendor profile not found" ? 404 : 500)
      .json({ message: error.message || "Server error" });
  }
};

// DELETE menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const id = itemId;
    const vendor = await getVendor(req.user._id);

    const menuItem = await MenuItem.findOne({ _id: id, vendor: vendor._id });
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Delete image if exists
    if (menuItem.image?.public_id) {
      await cloudinary.uploader
        .destroy(menuItem.image.public_id)
        .catch(console.error);
    }

    await MenuItem.findByIdAndDelete(id);
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res
      .status(error.message === "Vendor profile not found" ? 404 : 500)
      .json({ message: error.message || "Server error" });
  }
};

// TOGGLE menu item availability
const toggleAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const vendor = await getVendor(req.user._id);

    // Step 1: Find the item
    const menuItem = await MenuItem.findOne({
      _id: itemId,
      vendor: vendor._id,
    });
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Step 2: Toggle the value
    menuItem.isAvailable = !menuItem.isAvailable;

    // Step 3: Save updated item
    await menuItem.save();

    return res.json({
      id: menuItem._id,
      isAvailable: menuItem.isAvailable,
      message: `Item ${
        menuItem.isAvailable ? "marked as available" : "marked as sold out"
      }`,
    });
  } catch (error) {
    return res
      .status(error.message === "Vendor profile not found" ? 404 : 500)
      .json({ message: error.message || "Server error" });
  }
};

export {
  getVendorMenu,
  createCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
