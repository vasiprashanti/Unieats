
import express from 'express';
import { createContent, getAllContent, getContentById, updateContent, deleteContent } from '../controllers/contentController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { uploadImage } from '../middleware/fileUpload.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// --- PUBLIC ROUTES (Cached) ---
// Get all active content (banners, FAQs, etc.)
router.get('/', cacheMiddleware, getAllContent);
// Get a single piece of content by ID
router.get('/:id', cacheMiddleware, getContentById);


// --- ADMIN-ONLY ROUTES ---
const adminProtected = [verifyFirebaseToken, checkRole('admin')];

// Create new content
router.post('/', ...adminProtected, uploadImage.single('image'), createContent);
// Update content
router.put('/:id', ...adminProtected, uploadImage.single('image'), updateContent);
// Delete content
router.delete('/:id', ...adminProtected, deleteContent);

export default router;