import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
    // Link to the User model of the owner
    businessName: {
        type: String,
        required: [true, 'Business name is required.'],
        trim: true,
        unique: true,
    },
    businessAddress: {
        street: { type: String},
        city: { type: String },
        state: { type: String},
        zipCode: { type: String },
    },
    phone: {
        type: String,
        required: [true, 'Business phone number is required.'],
    },
    cuisineType: {
        type: [String],
        required: [true, 'At least one cuisine type is required.'],
    },
    // Approval status controlled by admins
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true,
    },
    // Cloudinary URLs for uploaded documents
    documents: {
        businessLicense: {
            url: String,
            public_id: String,
        },
        foodSafetyCertificate: {
            url: String,
            public_id: String,
        },
    },
    operatingHours: {
        // Example: { day: "Monday", open: "09:00", close: "22:00" }
        type: Array,
        default: [],
    },
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;