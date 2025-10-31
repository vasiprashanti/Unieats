import express from "express";
import {
  rateOrderItems,
  getUserOrders,
  verifyRazorpayPayment,
} from "../controllers/userOrderController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import devAuth from "../middleware/devAuth.js";

const orderRouter = express.Router();

// Rate all ordered items in a batch
orderRouter.post("/:orderId/rate", verifyFirebaseToken, rateOrderItems);

// Get user's previous orders
orderRouter.get("/prevOrders", verifyFirebaseToken, getUserOrders);

// Verify Razorpay payment after user completes payment on frontend
orderRouter.post(
  "/:orderId/verify-payment",
  verifyFirebaseToken,
  verifyRazorpayPayment
);

export default orderRouter;
