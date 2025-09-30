import express from 'express';
import { getCart, addItemToCart, updateCartItem, clearCart } from '../controllers/cartController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes are private and require a user to be logged in
router.use(verifyFirebaseToken);

router.route('/')
    .get(getCart)       // Get the current cart
    .post(addItemToCart) // Add a new item to the cart
    .delete(clearCart);  // Clear the entire cart

router.route('/item')
    .patch(updateCartItem); // Update an item's quantity (or remove it)

export default router;