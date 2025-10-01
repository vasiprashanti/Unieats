import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    businessName: { type: String, required: [true, "Business name is required."], trim: true, unique: true },
    businessAddress: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        zipCode: { type: String, required: true, trim: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    phone: {
      type: String,
      required: [true, "Business phone number is required."],
    },
    contactPhone: { type: String, required: true },
    cuisineType: { type: [String], required: true },
    cuisineType: {
      type: [String],
      required: [true, "At least one cuisine type is required."],
    },
    // Approval status controlled by admins
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
  },
    profileImage: { url: String, public_id: String },
    commissionRate: {
        type: Number,
        default: 0.10,
        min: 0,
        max: 1,
    },
    
    operatingHours: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        open: String,  // e.g., "09:00"
        close: String, // e.g., "22:00"
        isClosed: { type: Boolean, default: false }
    }],
    documents: [{
        documentType: String, // e.g., "Business License"
        url: String,
        public_id: String,
        
        status: {
            type: String,
            enum: ['pending_review', 'approved', 'rejected'],
            default: 'pending_review'
        },
        rejectionReason: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],

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
    },

}, { timestamps: true });

vendorSchema.index({ businessName: 'text', cuisineType: 'text' });

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
