import Review from "../models/Review.model.js";
import Order from "../models/Order.model.js";

const createReview = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Business Logic: Check if the user has actually completed an order from this vendor
    const hasOrdered = await Order.findOne({
      user: userId,
      vendor: vendorId,
      status: "delivered",
    });
    if (!hasOrdered) {
      return res.status(403).json({
        success: false,
        message:
          "You must complete an order from this vendor before leaving a review.",
      });
    }

    // Business Logic: Check if the user has already reviewed this vendor
    const existingReview = await Review.findOne({
      user: userId,
      vendor: vendorId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a review for this vendor.",
      });
    }

    const review = await Review.create({
      vendor: vendorId,
      user: userId,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { createReview };
