import express from 'express';
import { check } from 'express-validator';
import { getAdminDashboard, getVendors, updateVendorApproval } from '../controllers/adminController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { getBasicAnalytics } from '../controllers/analyticsController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();
const adminOnly = [verifyFirebaseToken, checkRole('admin')];

router.get('/dashboard', ...adminOnly, getAdminDashboard);

// Vendor Management
router.get('/vendors', ...adminOnly, getVendors);
router.patch('/vendors/:id/approval', ...adminOnly, updateVendorApproval);

// Settings Routes
router.get('/settings', ...adminOnly, getSettings);
router.post(
    '/settings',
    ...adminOnly,
    [
        check('deliveryFee').optional().isNumeric().withMessage('Delivery fee must be a number.'),
        check('commissionRate').optional().isFloat({ min: 0, max: 1 }).withMessage('Commission rate must be between 0 and 1.'),
    ],
    updateSettings
);
router.get('/analytics', ...adminOnly, getBasicAnalytics);

export default router;