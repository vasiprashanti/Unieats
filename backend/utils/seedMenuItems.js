import mongoose from "mongoose";
import dotenv from "dotenv";
import { MenuItem, MenuCategory } from "../models/MenuItem.model.js";
import Vendor from "../models/Vendor.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding menu items");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const sampleMenuItems = {
  "Veg Sandwiches": [
    {
      name: "Veggie Delite",
      description: "Fresh vegetables with your choice of bread and sauce",
      price: 180,
      vegOrNonVeg: "veg",
      prepTime: 5,
      tags: ["healthy", "fresh", "vegetables"],
    },
    {
      name: "Aloo Patty",
      description: "Spiced potato patty with fresh vegetables",
      price: 200,
      vegOrNonVeg: "veg",
      prepTime: 7,
      tags: ["spicy", "indian", "potato"],
    },
    {
      name: "Paneer Tikka",
      description: "Grilled paneer with tikka sauce and vegetables",
      price: 250,
      vegOrNonVeg: "veg",
      prepTime: 8,
      tags: ["paneer", "tikka", "grilled"],
    },
  ],
  "Chicken Sandwiches": [
    {
      name: "Chicken Teriyaki",
      description: "Tender chicken with teriyaki sauce",
      price: 280,
      vegOrNonVeg: "nonveg",
      prepTime: 8,
      tags: ["chicken", "teriyaki", "asian"],
    },
    {
      name: "Chicken Tikka",
      description: "Spiced chicken tikka with fresh vegetables",
      price: 300,
      vegOrNonVeg: "nonveg",
      prepTime: 10,
      tags: ["chicken", "tikka", "spicy"],
    },
    {
      name: "BBQ Chicken",
      description: "Smoky BBQ chicken with special sauce",
      price: 320,
      vegOrNonVeg: "nonveg",
      prepTime: 10,
      tags: ["chicken", "bbq", "smoky"],
    },
  ],
  "Turkey & Ham": [
    {
      name: "Turkey Breast",
      description: "Sliced turkey breast with fresh vegetables",
      price: 350,
      vegOrNonVeg: "nonveg",
      prepTime: 6,
      tags: ["turkey", "protein", "lean"],
    },
    {
      name: "Black Forest Ham",
      description: "Premium ham with cheese and vegetables",
      price: 380,
      vegOrNonVeg: "nonveg",
      prepTime: 6,
      tags: ["ham", "cheese", "premium"],
    },
  ],
  Wraps: [
    {
      name: "Chicken Wrap",
      description: "Grilled chicken wrapped in soft tortilla",
      price: 220,
      vegOrNonVeg: "nonveg",
      prepTime: 8,
      tags: ["wrap", "chicken", "tortilla"],
    },
    {
      name: "Veggie Wrap",
      description: "Fresh vegetables wrapped in soft tortilla",
      price: 180,
      vegOrNonVeg: "veg",
      prepTime: 5,
      tags: ["wrap", "vegetables", "healthy"],
    },
  ],
  Beverages: [
    {
      name: "Coke",
      description: "Chilled Coca Cola",
      price: 60,
      vegOrNonVeg: "veg",
      prepTime: 1,
      tags: ["cold drink", "cola"],
    },
    {
      name: "Fresh Lime Soda",
      description: "Fresh lime with soda water",
      price: 80,
      vegOrNonVeg: "veg",
      prepTime: 3,
      tags: ["fresh", "lime", "soda"],
    },
    {
      name: "Coffee",
      description: "Hot brewed coffee",
      price: 90,
      vegOrNonVeg: "veg",
      prepTime: 4,
      tags: ["hot", "coffee", "caffeine"],
    },
  ],
  Sides: [
    {
      name: "Cookies",
      description: "Freshly baked chocolate chip cookies",
      price: 50,
      vegOrNonVeg: "veg",
      prepTime: 1,
      tags: ["cookies", "sweet", "baked"],
    },
    {
      name: "Chips",
      description: "Crispy potato chips",
      price: 40,
      vegOrNonVeg: "veg",
      prepTime: 1,
      tags: ["chips", "crispy", "snack"],
    },
  ],
};

const seedMenuItems = async () => {
  try {
    // Find Subway vendor
    const subwayVendor = await Vendor.findOne({ businessName: "Subway" });
    if (!subwayVendor) {
      console.log("Subway vendor not found!");
      return;
    }

    console.log(`Found Subway vendor: ${subwayVendor._id}`);

    // Get all categories for this vendor
    const categories = await MenuCategory.find({ vendor: subwayVendor._id });
    console.log(`Found ${categories.length} categories`);

    // Create a map of category name to category ID
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Add menu items for each category
    for (const [categoryName, items] of Object.entries(sampleMenuItems)) {
      if (categoryMap[categoryName]) {
        console.log(`\nAdding items to category: ${categoryName}`);

        for (const item of items) {
          // Check if item already exists
          const existingItem = await MenuItem.findOne({
            vendor: subwayVendor._id,
            name: item.name,
            category: categoryMap[categoryName],
          });

          if (existingItem) {
            console.log(`  - ${item.name} already exists, skipping...`);
            continue;
          }

          const menuItem = new MenuItem({
            vendor: subwayVendor._id,
            category: categoryMap[categoryName],
            ...item,
          });

          await menuItem.save();
          console.log(`  + Added: ${item.name} - ₹${item.price}`);
        }
      } else {
        console.log(`Category "${categoryName}" not found, skipping...`);
      }
    }

    console.log("\n✅ Menu items seeding completed!");

    // Show summary
    const totalItems = await MenuItem.countDocuments({
      vendor: subwayVendor._id,
    });
    console.log(`Total menu items for Subway: ${totalItems}`);
  } catch (error) {
    console.error("Error seeding menu items:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
connectDB().then(() => {
  seedMenuItems();
});
