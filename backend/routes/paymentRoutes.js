import express from "express";
import { check } from "express-validator";
import { placeOrder, confirmUpiPayment} from "../controllers/userOrderController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { updateOrderStatus} from "../controllers/vendorController.js";

const router = express.Router();
const authenticated = [verifyFirebaseToken];

// /api/v1/payments/orders
// Route to place an order
router.post(
  "/orders",
  ...authenticated,
  [
    check("vendorId", "Vendor ID is required").notEmpty(),
    check("items", "Items array is required").isArray({ min: 1 }),
    check("deliveryAddress.street", "Street address is required").notEmpty(),
    check("deliveryAddress.city", "City is required").notEmpty(),
    check("deliveryAddress.state", "State is required").notEmpty(),
    check("deliveryAddress.zipCode", "Zip code is required").notEmpty(),
    check("paymentMethod", "Payment method is required").isIn(["cod", "upi"]),
    check("totalPrice", "Total price is required").isNumeric({ min: 0 }),
  ],
  placeOrder
);

// @route   PATCH /api/v1/payments/confirm/:orderId
// Delivery agent confirms the payment
router.patch("/confirm/:orderId", ...authenticated, confirmUpiPayment);

// @route   PATCH /api/v1/payments/vendor-confirm/:orderId
// Vendor confirms order (changes status from pending to accepted)
router.patch("/vendor-confirm/:orderId", ...authenticated, updateOrderStatus);

export default router;
