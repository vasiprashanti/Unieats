
import express from 'express';
import { registerVendor } from '../controllers/vendorController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { uploadDocuments, uploadImage } from '../middleware/fileUpload.js';

const router = express.Router();

// @route   POST /api/v1/vendors/register
// @desc    Register a new vendor profile
// @access  Private (requires user to be logged in)
router.post(
    '/register',
    verifyFirebaseToken, // Ensure user is logged in
    uploadDocuments.fields([ // Handle multiple file fields
        { name: 'businessLicense', maxCount: 1 },
        { name: 'foodSafetyCertificate', maxCount: 1 }
    ]),
    registerVendor
);

export default router;