import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // e.g., 'banner', 'faq', 'policy'
    type: {
      type: String,
      required: true,
      enum: ["banner", "faq", "policy"],
    },
    // For text-based content like FAQs or policies
    body: {
      type: String,
    },
    // For image-based content like banners
    image: {
      url: String,
      public_id: String,
    },
    // To control visibility on the frontend
    isActive: {
      type: Boolean,
      default: false,
    },
    // Simple version control
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);
export default Content;
