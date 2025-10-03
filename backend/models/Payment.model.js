import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    periodStartDate: {
      type: Date,
      required: true,
    },
    periodEndDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },
    transactionId: {
      // To store the ID from the payment processor
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
