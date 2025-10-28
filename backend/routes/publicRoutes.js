import express from 'express';
import { getPublicBanners, getRestaurants, getRestaurantDetails } from '../controllers/publicController.js';
import { getVendorDetails } from '../controllers/vendorController.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js'; 

const router = express.Router();

// @route   GET /api/v1/public/banners
// @desc    Get all published banners for the homepage
// @access  Public
router.get('/banners', getPublicBanners);

// @route   GET /api/v1/public/restaurants
// @desc    Get a list of approved restaurants, with search and filtering
// @access  Public
router.get('/restaurants', getRestaurants);

// @route   GET /api/v1/public/restaurants/:id
// @desc    Get details for a single restaurant, including its menu and reviews
// @access  Public
router.get('/restaurants/:id', cacheMiddleware(300), getVendorDetails); // Cache for 5 minutes

export default router;