import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// After a review is saved or deleted, this static method will be called to update the vendor's average rating.
reviewSchema.statics.calculateAverageRating = async function (vendorId) {
  const stats = await this.aggregate([
    {
      $match: { vendor: vendorId },
    },
    {
      $group: {
        _id: "$vendor",
        reviewCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model("Vendor").findByIdAndUpdate(vendorId, {
        reviewCount: stats[0].reviewCount,
        averageRating: stats[0].averageRating,
      });
    } else {
      // If there are no reviews, reset to default
      await mongoose.model("Vendor").findByIdAndUpdate(vendorId, {
        reviewCount: 0,
        averageRating: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Hook to call the calculation after a new review is saved
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.vendor);
});

// Hook to call the calculation after a review is removed
reviewSchema.post("remove", function () {
  this.constructor.calculateAverageRating(this.vendor);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
