import Cart from '../models/Cart.model.js';
import MenuItem from '../models/MenuItem.model.js';
import Vendor from '../models/Vendor.model.js';

// Helper function to calculate cart totals
const calculateTotals = (cart) => {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Placeholder for delivery fee logic (Day 16 task)
    cart.deliveryFee = cart.subtotal > 0 ? 50 : 0; // Fixed fee for now
    cart.total = cart.subtotal + cart.deliveryFee;
    return cart;
};

// Get the user's current cart
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.menuItem', 'name image');
        if (!cart) {
            return res.status(200).json({ success: true, message: 'Cart is empty.', data: null });
        }
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Add an item to the cart
const addItemToCart = async (req, res) => {
    const { menuItemId, quantity } = req.body;
    const userId = req.user._id;

    try {
        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found.' });

        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            // If cart exists, check if it's for the same vendor
            if (cart.vendor.toString() !== menuItem.vendor.toString()) {
                return res.status(400).json({ message: 'You can only order from one restaurant at a time. Please clear your cart first.' });
            }

            // Check if item already exists in cart
            const itemIndex = cart.items.findIndex(p => p.menuItem.toString() === menuItemId);
            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ menuItem: menuItemId, quantity, price: menuItem.price });
            }
        } else {
            // No cart exists, create a new one
            cart = new Cart({
                user: userId,
                vendor: menuItem.vendor,
                items: [{ menuItem: menuItemId, quantity, price: menuItem.price }]
            });
        }
        
        cart = calculateTotals(cart);
        await cart.save();
        res.status(200).json({ success: true, data: cart });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update item quantity in cart
const updateCartItem = async (req, res) => {
    const { menuItemId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found.' });

        const itemIndex = cart.items.findIndex(p => p.menuItem.toString() === menuItemId);
        if (itemIndex > -1) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            cart = calculateTotals(cart);
            await cart.save();
            res.status(200).json({ success: true, data: cart });
        } else {
            res.status(404).json({ message: 'Item not in cart.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Clear the entire cart
const clearCart = async (req, res) => {
    try {
        await Cart.deleteOne({ user: req.user._id });
        res.status(200).json({ success: true, message: 'Cart cleared successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export { getCart, addItemToCart, updateCartItem, clearCart };