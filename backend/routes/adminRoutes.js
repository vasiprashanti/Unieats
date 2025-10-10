import express from 'express';
import { check } from 'express-validator';
import { getAdminDashboard, getVendors, updateVendorApproval } from '../controllers/adminController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { getBasicAnalytics } from '../controllers/adminAnalyticsController.js';
import { verifyFirebaseToken, checkRole } from '../middleware/authMiddleware.js';
import { monitorRealTimeOrders, exportOrdersToCSV } from '../controllers/adminOrderController.js';
import { getAllUsers} from '../controllers/adminUserController.js';

const router = express.Router();
const adminOnly = [verifyFirebaseToken, checkRole("admin")];

router.get("/dashboard", ...adminOnly, getAdminDashboard);

// Vendor Management
router.get("/vendors", getVendors);
router.patch("/vendors/:id/approval", updateVendorApproval);

// Settings Routes
router.get("/settings", ...adminOnly, getSettings);
router.post(
  "/settings",
  ...adminOnly,
  [
    check("deliveryFee")
      .optional()
      .isNumeric()
      .withMessage("Delivery fee must be a number."),
    check("commissionRate")
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage("Commission rate must be between 0 and 1."),
  ],
  updateSettings
);
router.get("/analytics", ...adminOnly, getBasicAnalytics);


//  Admin Order Management Routes 

// @route   GET /api/v1/admin/orders/monitor
// @desc    Get a real-time feed of all active orders on the platform
// @access  Private (Admin Only)
router.get(
    '/orders/monitor',
    verifyFirebaseToken,
    checkRole('admin'),
    monitorRealTimeOrders
);

// @route   GET /api/v1/admin/orders/export
// @desc    Export all order data to a CSV file
// @access  Private (Admin Only)
router.get(
    '/orders/export',
    verifyFirebaseToken,
    checkRole('admin'),
    exportOrdersToCSV
);

// --- User Management Routes ---

// @route   GET /api/v1/admin/users
// @desc    Get a paginated list of all users
// @access  Private (Admin Only)
router.get(
    '/users',
    verifyFirebaseToken,
    checkRole('admin'),
    getAllUsers
);


export default router;