import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // Indexed for user order history
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true }, // Indexed for vendor dashboards
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending',
        index: true, // Heavily indexed for filtering and monitoring
    },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
    },
    paymentDetails: {
        paymentId: String,
        status: String,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    acceptedAt: { type: Date },
    readyAt: { type: Date },
}, { timestamps: true });

// Compound index for efficient monitoring queries
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.pre('save', function(next) {
    if (this.isNew) {
        this.statusHistory.push({ status: this.status, timestamp: new Date() });
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;