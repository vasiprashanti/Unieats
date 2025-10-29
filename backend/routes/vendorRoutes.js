import express from "express";
import {
  registerVendor,
  updateVendorProfile,
  getVendorProfile,
  getAllVendors,
  getVendorDetails,
  getVendorStatus,
  
} from "../controllers/vendorController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";
import { uploadDocuments, uploadImage } from "../middleware/fileUpload.js";
import {
  getVendorOrders,
  updateOrderStatus,
} from "../controllers/vendorController.js";
import {
  createMenuItem,
  getVendorMenu,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  toggleAvailability
} from "../controllers/menuController.js";
import { getVendorAnalytics } from "../controllers/vendorAnalyticsController.js";
import {
  getPayoutHistory,
  calculateCurrentPayout,
} from "../controllers/paymentController.js";

const router = express.Router();

// GET all vendors (restaurants)
router.get("/restaurants", verifyFirebaseToken, getAllVendors); // Will support search via query param
// GET vendor (restaurant) details + menu

// CREATE a new category
router.post("/categories", verifyFirebaseToken, createCategory);

// GET vendor (restaurant) details + menu (cached)
router.get(
  "/restaurants/:id",
  verifyFirebaseToken,
  cacheMiddleware(300), // Cache for 5 minutes
  getVendorDetails
);

// @route   PATCH /api/v1/vendors/upi
// @desc    Update vendor's UPI ID
// @access  Private (requires vendor authentication)
// router.patch("/upi", verifyFirebaseToken, updateVendorUpiId);

// @route   POST /api/v1/vendors/register
// @desc    Register a new vendor profile
// @access  Private (requires user to be logged in)
router.post(
    '/register',
    uploadDocuments.fields([ // The file handler is still needed
        { name: 'businessLicense', maxCount: 1 },
        { name: 'foodSafetyCertificate', maxCount: 1 }
    ]),
    registerVendor 
);

// @route   GET /api/v1/vendors/profile
// @desc    Get the vendor profile
// @access  Private (requires user to be logged in)
router.get("/profile", verifyFirebaseToken, getVendorProfile);

// @route   POST /api/v1/vendors/profile
// @desc    Update existing vendor profile
// @access  Private (requires user to be logged in)
router.patch(
  "/profile",
  verifyFirebaseToken, // Ensure user is logged in
  updateVendorProfile
);

// @route   POST /api/v1/vendors/menu
// @desc    Adding menu item
// @access  Private (requires user to be logged in)
router.post(
  "/menu",
  verifyFirebaseToken, // Ensure user is logged in
  uploadImage.single("image"),
  createMenuItem
);

// Get all orders for the logged-in vendor (with filtering)
router.get("/orders", verifyFirebaseToken, getVendorOrders);

// Get vendor status
router.get("/vendorStatus", verifyFirebaseToken,getVendorStatus );

// Update the status of a specific order
router.patch("/orders/:orderId/status", verifyFirebaseToken, updateOrderStatus);

router.get("/menu", verifyFirebaseToken, getVendorMenu);

router.patch(
  "/menu/:itemId",
  verifyFirebaseToken,
  uploadImage.single("image"),
  updateMenuItem
);

router.delete("/menu/:itemId", verifyFirebaseToken, deleteMenuItem);



router.patch(
  "/menu/:itemId/availability",
  verifyFirebaseToken,
  toggleAvailability
);

router.get("/analytics", verifyFirebaseToken, getVendorAnalytics);

router.get("/payouts", verifyFirebaseToken, getPayoutHistory);
router.get("/payouts/current", verifyFirebaseToken, calculateCurrentPayout);

export default router;
