import express from 'express';
import { check } from 'express-validator';
import { registerUser, getMe } from '../controllers/authController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { registerUser, getMe, verifyToken } from '../controllers/authController.js';
import { getBasicAnalytics, getComprehensiveAnalytics } from '../controllers/analyticsController.js';
import { monitorRealTimeOrders, exportOrdersToCSV } from '../controllers/orderAdminController.js'; 


const router = express.Router();
const adminOnly = [verifyFirebaseToken, checkRole('admin')];

// REGISTER ROUTE
// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    // Validation middleware
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('firebaseUid', 'Firebase UID is required').not().isEmpty(),
  ],
  registerUser
);

// GET ME (PROFILE) ROUTE 
// @route   GET /api/v1/auth/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', verifyFirebaseToken, getMe); // <-- Middleware is applied here!

// @route   GET /api/v1/auth/verify
// @desc    Verify a token is still valid
// @access  Private
router.get('/verify', verifyFirebaseToken, verifyToken);

// --- Analytics Routes ---
router.get('/analytics/basic', ...adminOnly, getBasicAnalytics);
router.get('/analytics/comprehensive', ...adminOnly, getComprehensiveAnalytics);

// Order Management & Export Routes
router.get('/orders/monitor', ...adminOnly, monitorRealTimeOrders);
router.get('/orders/export-csv', ...adminOnly, exportOrdersToCSV);

export default router;