import Content from '../models/Content.model.js';
import { cloudinary } from '../config/cloudinary.js';
import { clearCache } from '../middleware/cacheMiddleware.js';

const uploadToCloudinaryOptimized = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'image',
                folder: 'unieats_content',
                // --- Image Optimization ---
                transformation: [
                    { width: 1200, crop: 'limit' }, // Resize to max width of 1200px
                    { quality: 'auto:good' },       // Adjust quality automatically
                    { fetch_format: 'auto' }        // Deliver in modern format like WebP
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve({ url: result.secure_url, public_id: result.public_id });
            }
        );
        uploadStream.end(file.buffer);
    });
};

// --- CREATE ---
const createContent = async (req, res) => {
    try {
        let imageData;
        if (req.file) {
            imageData = await uploadToCloudinaryOptimized(req.file);
        }

        const newContent = new Content({
            ...req.body,
            image: imageData,
        });

        await newContent.save();
        clearCache('/api/v1/content'); // Clear cache for the list view
        res.status(201).json({ success: true, data: newContent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// --- READ ALL ---
const getAllContent = async (req, res) => {
    try {
        const query = {};
        // Allow filtering by type, e.g., /api/v1/content?type=banner
        if (req.query.type) {
            query.type = req.query.type;
        }
        // For public users, only fetch active content
        if (req.user?.role !== 'admin') {
            query.isActive = true;
        }
        
        const content = await Content.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: content.length, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- READ ONE ---
const getContentById = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- UPDATE ---
const updateContent = async (req, res) => {
    try {
        let content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        let imageData = content.image;
        if (req.file) {
            // If there's a new image, delete the old one from Cloudinary
            if (content.image && content.image.public_id) {
                await cloudinary.uploader.destroy(content.image.public_id);
            }
            imageData = await uploadToCloudinaryOptimized(req.file);
        }

        // Update fields
        content.title = req.body.title || content.title;
        content.type = req.body.type || content.type;
        content.body = req.body.body || content.body;
        content.isActive = req.body.isActive !== undefined ? req.body.isActive : content.isActive;
        content.image = imageData;

        // Increment version
        content.version += 1;

        const updatedContent = await content.save();
        
        clearCache(`/api/v1/content`);
        clearCache(`/api/v1/content/${req.params.id}`);

        res.status(200).json({ success: true, data: updatedContent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// --- DELETE ---
const deleteContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        // Delete image from Cloudinary if it exists
        if (content.image && content.image.public_id) {
            await cloudinary.uploader.destroy(content.image.public_id);
        }

        await content.deleteOne();

        clearCache(`/api/v1/content`);
        clearCache(`/api/v1/content/${req.params.id}`);

        res.status(200).json({ success: true, message: 'Content deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export { createContent, getAllContent, getContentById, updateContent, deleteContent };
