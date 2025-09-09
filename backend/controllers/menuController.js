import Vendor from '../models/Vendor.model.js';
import MenuItem from '../models/MenuItem.model.js';
import { cloudinary } from '../config/cloudinary.js';

const createMenuItem = async (req, res) => {
    try {
        // VALIDATION: Check for required text fields
        const { name, price, description, category } = req.body;
        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Name, price, and category are required.' });
        }

        // SECURITY: Find the vendor profile for the logged-in user
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) {
            return res.status(403).json({ message: "You are not authorized to add menu items." });
        }

        // ASSEMBLY: Create the new menu item in memory
        const newMenuItem = new MenuItem({
            vendor: vendorProfile._id, // The critical ownership link
            name: name,
            price: price,
            description: description,
            category: category,
        });

        // IMAGE HANDLING: Attach the image if it exists
        if (req.file) {
            newMenuItem.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }

        // SAVE: Commit the new menu item to the database
        const savedItem = await newMenuItem.save();

        // RESPOND: Send a success response
        res.status(201).json({
            message: 'Menu item added successfully!',
            menuItem: savedItem
        });

    } catch (error) {
        console.error("Error creating menu item:", error);
        res.status(500).json({ message: "Server error while adding menu item." });
    }
};

// --- READ all menu items for a vendor ---
const getMenuItems = async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) {
            return res.status(403).json({ message: "Vendor profile not found." });
        }

        const menuItems = await MenuItem.find({ vendor: vendorProfile._id });
        res.status(200).json({ menuItems });

    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).json({ message: "Server error while fetching menu items." });
    }
};

// --- UPDATE a specific menu item ---
const updateMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const updates = req.body;

        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) {
            return res.status(403).json({ message: "Vendor profile not found." });
        }

        const menuItem = await MenuItem.findById(itemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found.' });
        }

        // Security Check: Ensure the menu item belongs to the logged-in vendor
        if (menuItem.vendor.toString() !== vendorProfile._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this menu item.' });
        }
        
        // Handle new image upload
        if (req.file) {
            // If an old image exists, delete it from Cloudinary
            if (menuItem.image && menuItem.image.public_id) {
                await cloudinary.uploader.destroy(menuItem.image.public_id);
            }
            updates.image = { url: req.file.path, public_id: req.file.filename };
        }

        Object.assign(menuItem, updates);
        const updatedItem = await menuItem.save();

        res.status(200).json({ message: 'Menu item updated successfully!', menuItem: updatedItem });

    } catch (error) {
        console.error("Error updating menu item:", error);
        res.status(500).json({ message: "Server error while updating menu item." });
    }
};

// --- DELETE a specific menu item ---
const deleteMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) {
            return res.status(403).json({ message: "Vendor profile not found." });
        }

        const menuItem = await MenuItem.findById(itemId);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found.' });
        }

        // Security Check: Ensure the menu item belongs to the logged-in vendor
        if (menuItem.vendor.toString() !== vendorProfile._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this menu item.' });
        }

        // If an image exists, delete it from Cloudinary BEFORE deleting the DB record
        if (menuItem.image && menuItem.image.public_id) {
            await cloudinary.uploader.destroy(menuItem.image.public_id);
        }

        await menuItem.deleteOne(); // Replaced deprecated .remove()

        res.status(200).json({ message: 'Menu item deleted successfully!' });

    } catch (error) {
        console.error("Error deleting menu item:", error);
        res.status(500).json({ message: "Server error while deleting menu item." });
    }
};

export { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem };
