import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required."],
      trim: true,
      unique: true,
    },

    // --- CONSOLIDATED ---
    // Only one definition for businessAddress
    businessAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
    },

    // --- CONSOLIDATED ---
    // We will use 'contactPhone' as the official name to match our validation logic.
    contactPhone: {
      type: String,
      required: [true, "Business phone number is required."],
    },

    // --- CONSOLIDATED ---
    // Only one definition for cuisineType, using the more descriptive version.
    cuisineType: {
      type: [String],
      required: [true, "At least one cuisine type is required."],
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    profileImage: { url: String, public_id: String },
    commissionRate: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1,
    },
    operatingHours: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    documents: [
      {
        documentType: String,
        url: String,
        public_id: String,
        status: {
          type: String,
          enum: ["pending_review", "approved", "rejected"],
          default: "pending_review",
        },
        rejectionReason: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    upiId: {
      type: String,
      trim: true,
      match: [
        /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
        "Please enter a valid UPI ID",
      ],
    },
  },
  { timestamps: true }
);

vendorSchema.index({ businessName: "text", cuisineType: "text" });

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
