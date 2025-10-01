import mongoose from "mongoose";

// MenuCategory Schema
const menuCategorySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure unique category names per vendor
menuCategorySchema.index({ vendor: 1, name: 1 }, { unique: true });

// MenuItem Schema
const menuItemSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: {
      url: String,
      public_id: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
      index: true,
    },
    isAvailable: { type: Boolean, default: true },
    vegOrNonVeg: {
      type: String,
      enum: ["veg", "nonveg"],
      required: true,
    },
    prepTime: { type: Number }, // in minutes
    tags: [{ type: String }],
    // Rating system
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        order: String,
        value: { type: Number, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

// Add text index for search functionality
menuItemSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

// Models
const MenuCategory = mongoose.model("MenuCategory", menuCategorySchema);
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export { MenuItem, MenuCategory };
export default MenuItem;
