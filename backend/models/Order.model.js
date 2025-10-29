import mongoose from "mongoose";

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
    orderId: {
      type: Number,
      unique: true,
      index: true,
    },
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
    totalPrice: { type: Number, required: true },
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

    deliveryAddress: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },

    paymentDetails: {
      method: { type: String, enum: ["UPI", "COD"], default: "UPI" },
      transactionId: { type: String },
      upiId: { type: String },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
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
  },
  { timestamps: true }
);

// Compound indexes for efficient monitoring queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, status: 1, createdAt: -1 }); // Optimize vendor order queries
orderSchema.index({ vendor: 1, createdAt: -1 }); // Fast vendor order listing
orderSchema.index({ user: 1, createdAt: -1 }); // Fast user order history

// Counter schema for auto-incrementing order IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 100 }, // Start from 100 for 3-digit IDs
});

const Counter = mongoose.model("Counter", counterSchema);

// Function to get next order ID
async function getNextOrderId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "orderId" },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
}

// Pre-save middleware for auto-generating order ID and status history
orderSchema.pre("save", async function (next) {
  // Auto-generate orderId for new orders
  if (this.isNew && !this.orderId) {
    try {
      this.orderId = await getNextOrderId();
    } catch (error) {
      return next(error);
    }
  }

  // Add to status history for new orders
  if (this.isNew) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
