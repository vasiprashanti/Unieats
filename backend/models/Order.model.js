import mongoose from "mongoose";
import Counter from "./Counter.model.js";

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    // fee breakdown for analytics
    vendorCommission: { type: Number, default: 0 },
    vendorReceives: { type: Number, default: 0 },
    vendorOwes: { type: Number, default: 0 },

    // Razorpay-specific fields (Mode 2) - Note: Razorpay fee is handled by Razorpay, not stored here
    unieatsReceives: { type: Number, default: 0 }, // Total user pays (before Razorpay's cut)
    unieatsGross: { type: Number, default: 0 }, // Platform fee + vendor commission
    vendorPayout: { type: Number, default: 0 }, // What vendor receives in online payment

    status: {
      type: String,
      enum: [
        "payment_pending",
        "pending",
        "accepted",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "rejected",
        "cancelled",
      ],
      default: "payment_pending",
      index: true,
    },

      // dueId references a VendorDues entry if this order has been included in a generated due
      dueId: { type: mongoose.Schema.Types.ObjectId, ref: "VendorDues", index: true },
    deliveryAddress: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },

    paymentDetails: {
      method: {
        type: String,
        enum: ["UPI", "COD", "RAZORPAY"],
        default: "UPI",
      },
      transactionId: { type: String },
      upiId: { type: String },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      // Razorpay specific fields
      razorpayOrderId: { type: String }, // Razorpay order ID
      razorpayPaymentId: { type: String }, // Razorpay payment ID after successful payment
      razorpaySignature: { type: String }, // For payment verification
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    acceptedAt: { type: Date },
    readyAt: { type: Date },
    rejectedAt: { type: Date },

    // Added statusHistory to fix pre-save push error
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    orderCode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient monitoring queries
orderSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware for status history
orderSchema.pre("save", async function (next) {
  // Add status to history if it's new or modified
  if (this.isModified("status")) {
    const lastStatus = this.statusHistory[this.statusHistory.length - 1];
    if (!lastStatus || lastStatus.status !== this.status) {
      this.statusHistory.push({ status: this.status, timestamp: new Date() });
    }
  }

  // Generate custom order code ONLY if it's a new order and doesn't have one yet
  if (this.isNew && !this.orderCode) {
    try {
      // Get the next number from our 'orderId' sequence
      const nextId = await Counter.getNextSequenceValue("orderId");
      // Format it as 3 digits with leading zeros (e.g., 001, 015, 123)
      this.orderCode = nextId.toString().padStart(3, "0");
    } catch (error) {
      // If the counter fails, pass the error along
      return next(error);
    }
  }

  next(); // Continue with the save operation
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
