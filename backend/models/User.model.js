import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
  label: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  landmark: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
});

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      first: { type: String, required: true, trim: true },
      last: { type: String, required: true, trim: true },
    },
    yearOfStudy: {
      type: String,
      enum: ["", "1st Year", "2nd Year", "3rd Year", "4th Year"],
    },
    accommodation: {
      type: String,
      required: true,
      enum: ["Hosteller", "Non-Hosteller"],
    },
    hostelDetails: {
      // For Hostellers
      block: { type: String },
      room: { type: String },
    },
    // Replaced single offCampusAddress with an array for multiple addresses
    addresses: [addressSchema], // For Non-Hostellers

    // Notification Settings
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
