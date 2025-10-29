import express from "express";
import {
  rateOrderItems,
  getUserOrders,
} from "../controllers/userOrderController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import devAuth from "../middleware/devAuth.js";

const orderRouter = express.Router();

// Rate all ordered items in a batch
orderRouter.post("/:orderId/rate", verifyFirebaseToken, rateOrderItems);

orderRouter.get("/prevOrders", verifyFirebaseToken, getUserOrders);

export default orderRouter;
