import Order from '../models/Order.model.js';
import Vendor from '../models/Vendor.model.js';

//  READ all orders for a vendor, with advanced filtering 
const getVendorOrders = async (req, res) => {
    try {
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) { return res.status(403).json({ message: "Vendor profile not found." }); }
        const { status, date } = req.query;
        const query = { vendor: vendorProfile._id };
        if (status) { query.status = status; }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt = { $gte: startDate, $lt: endDate };
        }
        const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching vendor orders:", error);
        res.status(500).json({ message: "Server error while fetching orders." });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status: newStatus } = req.body;
        const vendorProfile = await Vendor.findOne({ owner: req.user._id });
        if (!vendorProfile) { return res.status(403).json({ message: "Vendor profile not found." }); }
        const order = await Order.findById(orderId).populate('user', 'name email');
        if (!order) { return res.status(404).json({ message: 'Order not found.' }); }
        if (order.vendor.toString() !== vendorProfile._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this order.' });
        }
        const currentStatus = order.status;
        const allowedTransitions = {
            pending: ['preparing', 'cancelled'],
            preparing: ['ready'],
            ready: ['out_for_delivery', 'delivered'],
            out_for_delivery: ['delivered'],
            delivered: [],
            cancelled: [],
        };
        if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
            return res.status(400).json({ message: `Invalid status transition from ${currentStatus} to ${newStatus}.` });
        }

        order.status = newStatus;
        order.statusHistory.push({ status: newStatus, timestamp: new Date() });
        
        //  Set timestamps for performance metrics 
        if (newStatus === 'preparing') {
            order.acceptedAt = new Date();
        } else if (newStatus === 'ready') {
            order.readyAt = new Date();
        }

        const updatedOrder = await order.save();
        const io = req.app.get('socketio');
        io.to(vendorProfile._id.toString()).emit('order_update', updatedOrder);
        io.to(order.user._id.toString()).emit('order_update', updatedOrder);
        res.status(200).json({ message: 'Order status updated successfully!', order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error while updating status." });
    }
};
export { getVendorOrders, updateOrderStatus };