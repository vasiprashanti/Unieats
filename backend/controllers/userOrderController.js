
import Cart from '../models/Cart.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';

// Step 1 - Place Order & Initiate Payment
const placeOrder = async (req, res) => {
    const { addressId } = req.body;
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        const user = await User.findById(userId);
        
        // use the user's primary residence, not a list of addresses
        let deliveryAddressString = '';
        if (user.accommodation === 'Hosteller' && user.hostelDetails) {
            deliveryAddressString = `Block ${user.hostelDetails.block}, Room ${user.hostelDetails.room}`;
        } else if (user.accommodation === 'Non-Hosteller' && user.offCampusAddress) {
            deliveryAddressString = `${user.offCampusAddress.addressLine1}, near ${user.offCampusAddress.landmark}`;
        } else {
             return res.status(400).json({ message: 'Please complete your address details in your profile before ordering.' });
        }
        
        // Find the vendor to get their UPI ID
        const vendor = await Vendor.findById(cart.vendor);
        if(!vendor || !vendor.upiId) {
            return res.status(400).json({ message: 'This vendor is not currently accepting payments.' });
        }

        const order = new Order({
            user: userId,
            vendor: cart.vendor,
            items: cart.items,
            totalAmount: cart.total,
            deliveryAddress: deliveryAddressString, // Use the generated address string
            status: 'payment_pending', // Set initial status
        });
        
        await order.save();

        // Respond with the details needed for the frontend to show the QR code
        res.status(201).json({ 
            success: true, 
            message: 'Order placed. Please complete the payment.', 
            data: {
                orderId: order._id,
                amount: order.totalAmount,
                upiId: vendor.upiId
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Step 2 - Confirm UPI Payment
const confirmUpiPayment = async (req, res) => {
    const { orderId } = req.params;
    const { transactionId } = req.body;
    const userId = req.user._id;

    if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required.' });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        
        // Security checks
        if(order.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to confirm this payment.' });
        }
        if(order.status !== 'payment_pending') {
            return res.status(400).json({ message: 'This order is not awaiting payment.' });
        }

        // Update the order
        order.status = 'pending'; // This is the status for the vendor to start preparing
        order.paymentDetails = {
            method: 'UPI',
            transactionId: transactionId,
            status: 'completed'
        };
        // Add to status history
        order.statusHistory.push({ status: 'pending', timestamp: new Date() });
        
        await order.save();

        // Now clear the user's cart
        await Cart.deleteOne({ user: userId });

        // Notify the vendor of the new, paid order
        const io = req.app.get('socketio');
        io.to(order.vendor.toString()).emit('new_order', order);

        res.status(200).json({ success: true, message: 'Payment confirmed. Your order is being prepared!', data: order });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ user: userId })
            .populate('vendor', 'businessName profileImage') // Get vendor details for display
            .sort({ createdAt: -1 }); // Show the most recent orders first

        res.status(200).json({ success: true, count: orders.length, data: orders });

    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export { placeOrder, confirmUpiPayment, getUserOrders };
