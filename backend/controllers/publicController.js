import Vendor from '../models/Vendor.js';
import Content from '../models/Content.js';
import MenuItem from '../models/MenuItem.js'; 
import Review from '../models/Review.js'; 

//  Get Published Banners 
const getPublicBanners = async (req, res) => {
    try {
        const banners = await Content.find({ type: 'banner', status: 'published' })
            .sort({ order: 1 }); // Sort by the order set in the admin panel

        res.status(200).json({ success: true, data: banners });
    } catch (error) {
        console.error("Error fetching banners:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get Approved Restaurants (with Search & Location Filtering)
const getRestaurants = async (req, res) => {
    try {
        const { search, city } = req.query; // e.g., /restaurants?search=pizza&city=Anytown

        // The base query is the most important security filter:
        // ONLY show vendors that have been approved by an admin.
        const query = { approvalStatus: 'approved' };

        // Search Functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Location-based Filtering
        if (city) {
            query['businessAddress.city'] = { $regex: city, $options: 'i' }; // Case-insensitive match
        }

        const restaurants = await Vendor.find(query)
            // Select only the fields safe for public view
            .select('businessName businessAddress cuisineType profileImage');

        res.status(200).json({ success: true, count: restaurants.length, data: restaurants });

    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


const getRestaurantDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Step 1: Find the approved vendor by their ID
        const vendor = await Vendor.findOne({ _id: id, approvalStatus: 'approved' })
            .select('-commissionRate -documents'); // Exclude sensitive info

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Restaurant not found or not approved.' });
        }

        // Step 2: Find all menu items for that vendor
        // Real-time availability is handled here by the `isAvailable` field in the MenuItem model
        const menu = await MenuItem.find({ vendor: vendor._id });
        
        // Step 3: Find all reviews for that vendor
        const reviews = await Review.find({ vendor: vendor._id })
            .populate('user', 'name'); // Show the name of the user who left the review

        res.status(200).json({
            success: true,
            data: {
                details: vendor,
                menu,
                reviews
            }
        });

    } catch (error) {
        console.error("Error fetching restaurant details:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export { getPublicBanners, getRestaurants, getRestaurantDetails };