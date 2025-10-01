// backend/middleware/devAuth.js
import User from "../models/User.model.js";
import Vendor from "../models/Vendor.model.js";
import MenuItem, { MenuCategory } from "../models/MenuItem.model.js";

// Simple development middleware to test the rating endpoint
const devAuth = async (req, res, next) => {
  // Only run if SKIP_AUTH=true
  if (process.env.SKIP_AUTH !== "true") return next();

  try {
    // Create test user
    let user = await User.findOne({ firebaseUid: "dev-user-1" });
    if (!user) {
      user = await User.create({
        firebaseUid: "dev-user-1",
        email: "devuser@local.test",
        name: "Dev User",
        role: "user",
      });
    }
    req.user = user;

    // Create test vendor
    let vendorOwner = await User.findOne({ firebaseUid: "dev-vendor-1" });
    if (!vendorOwner) {
      vendorOwner = await User.create({
        firebaseUid: "dev-vendor-1",
        email: "devvendor@local.test",
        name: "Dev Vendor",
        role: "vendor",
      });
    }

    let vendor = await Vendor.findOne({ owner: vendorOwner._id });
    if (!vendor) {
      vendor = await Vendor.create({
        owner: vendorOwner._id,
        businessName: "Test Restaurant",
        phone: "9876543210",
        cuisineType: ["Italian"],
        businessAddress: {
          street: "123 Main St",
          city: "Test City",
          state: "Test State",
          zipCode: "123456",
        },
        approvalStatus: "approved",
      });
    }

    // Create menu category first
    let category = await MenuCategory.findOne({
      vendor: vendor._id,
      name: "Test Items",
    });
    if (!category) {
      category = await MenuCategory.create({
        vendor: vendor._id,
        name: "Test Items",
        isActive: true,
      });
    }

    // Create menu items with specific IDs
    const pizzaId = "68da9513ad8c2ba0085d7117";
    const burgerId = "68da9513ad8c2ba0085d7118";

    if (!(await MenuItem.findById(pizzaId))) {
      await MenuItem.create({
        _id: pizzaId,
        name: "Pizza",
        price: 200,
        vendor: vendor._id,
        category: category._id,
        isAvailable: true,
        description: "Test Pizza",
        vegOrNonVeg: "veg",
      });
    }

    if (!(await MenuItem.findById(burgerId))) {
      await MenuItem.create({
        _id: burgerId,
        name: "Burger",
        price: 100,
        vendor: vendor._id,
        category: category._id,
        isAvailable: true,
        description: "Test Burger",
        vegOrNonVeg: "nonveg",
      });
    }

    // Create test order (delete existing incomplete one first)
    const OrderModel = (await import("../models/Order.model.js")).default;
    const testOrderId = "68da9513ad8c2ba0085d7119";

    // Always delete and recreate to ensure proper validation
    await OrderModel.findByIdAndDelete(testOrderId);

    await OrderModel.create({
      _id: testOrderId,
      user: user._id,
      vendor: vendor._id,
      items: [
        {
          menuItem: pizzaId,
          name: "Pizza",
          quantity: 1,
          price: 200,
        },
        {
          menuItem: burgerId,
          name: "Burger",
          quantity: 2,
          price: 100,
        },
      ],
      deliveryAddress: {
        street: "456 User St",
        city: "User City",
        state: "User State",
        zipCode: "654321",
      },
      totalPrice: 400,
      status: "delivered",
      isRated: false,
    });
  } catch (error) {
    console.log("❌ Error setting up test data:", error.message);
  }

  next();
};

export default devAuth;
