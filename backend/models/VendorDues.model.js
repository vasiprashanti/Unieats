import mongoose from "mongoose";

const vendorDuesSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    periodStartDate: { type: Date, required: true },
    periodEndDate: { type: Date, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "cancelled"],
      default: "pending",
    },
    ordersIncluded: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Order", index: true },
    ],
    transactionRef: { type: String },
    notes: { type: String },
    clearedAt: { type: Date },
  },
  { timestamps: true }
);

const VendorDues = mongoose.model("VendorDues", vendorDuesSchema);
export default VendorDues;
