import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  isDefault: { type: Boolean, default: false },
});

const paymentMethodSchema = new mongoose.Schema({
  type: { type: String, enum: ["upi", "cashonDelivery"], required: true },
  upiId: String,
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
      index: true,
    },
    addresses: [addressSchema],
    paymentMethods: [paymentMethodSchema],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
