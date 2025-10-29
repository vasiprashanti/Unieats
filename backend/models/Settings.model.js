import mongoose from "mongoose";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto
  .createHash("sha256")
  .update(String(process.env.SETTINGS_ENCRYPTION_KEY))
  .digest("base64")
  .substring(0, 32);

// --- ENCRYPTION HELPER ---
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

// --- DECRYPTION HELPER ---
const decrypt = (text) => {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const settingsSchema = new mongoose.Schema(
  {
    // Using a singleton pattern with a fixed name
    name: {
      type: String,
      default: "platform-settings",
      unique: true,
    },
    commissionRate: {
      type: Number, // e.g., 0.15 for 15%
      default: 0.15,
    },
    // --- Encrypted Fields ---
    razorpayKeyId: {
      type: String,
    },
    razorpayKeySecret: {
      type: String,
    },
  },
  { timestamps: true }
);

// Middleware to encrypt sensitive fields before saving
settingsSchema.pre("save", function (next) {
  if (this.isModified("razorpayKeyId") && this.razorpayKeyId) {
    this.razorpayKeyId = encrypt(this.razorpayKeyId);
  }
  if (this.isModified("razorpayKeySecret") && this.razorpayKeySecret) {
    this.razorpayKeySecret = encrypt(this.razorpayKeySecret);
  }
  next();
});

// Method to decrypt and return sensitive fields
// We NEVER store the decrypted values in the database
settingsSchema.methods.getDecrypted = function () {
  const decrypted = this.toObject();
  if (decrypted.razorpayKeyId) {
    decrypted.razorpayKeyId = decrypt(decrypted.razorpayKeyId);
  }
  if (decrypted.razorpayKeySecret) {
    decrypted.razorpayKeySecret = decrypt(decrypted.razorpayKeySecret);
  }
  return decrypted;
};

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
