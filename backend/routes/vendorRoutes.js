import express from "express";
import {
  registerVendor,
  getAllVendors,
  getVendorDetails,
} from "../controllers/vendorController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { uploadDocuments, uploadImage } from "../middleware/fileUpload.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// GET all vendors (restaurants)
router.get("/restaurants", verifyFirebaseToken, getAllVendors); // Will support search via query param
// GET vendor (restaurant) details + menu

// GET vendor (restaurant) details + menu (cached)
router.get(
  "/restaurants/:id",
  verifyFirebaseToken,
  cacheMiddleware,
  getVendorDetails
);

// @route   POST /api/v1/vendors/register
// @desc    Register a new vendor profile
// @access  Private (requires user to be logged in)
router.post(
  "/register",
  verifyFirebaseToken,
  uploadDocuments.fields([
    // Handle multiple file fields
    { name: "businessLicense", maxCount: 1 },
    { name: "foodSafetyCertificate", maxCount: 1 },
  ]),
  registerVendor
);

export default router;
