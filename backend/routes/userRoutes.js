import express from 'express';
import { createReview } from '../controllers/reviewController.js';
import { placeOrder, confirmUpiPayment, getUserOrders } from '../controllers/userOrderController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/v1/user/reviews/:vendorId
// @desc    Create a new review for a vendor
// @access  Private (User must be logged in)
router.post('/reviews/:vendorId', verifyFirebaseToken, createReview);

// Step 1: Place the order and get payment details
router.post('/orders', verifyFirebaseToken, placeOrder);

// Step 2: Confirm the payment after user has paid via UPI app
router.post('/orders/:orderId/confirm-payment', verifyFirebaseToken, confirmUpiPayment);

// @route   GET /api/v1/user/orders
// @desc    Get all orders for the currently logged-in user
// @access  Private
router.get('/orders', verifyFirebaseToken, getUserOrders);

export default router;