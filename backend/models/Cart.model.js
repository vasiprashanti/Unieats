const cartItemSchema = new Schema({
    menuItem: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    // Price is stored at the time of adding to cart to avoid issues if menu price changes
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Each user has only one cart
        index: true
    },
    vendor: { // A cart can only contain items from one vendor at a time
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [cartItemSchema],
    // These will be calculated dynamically
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 }, // Placeholder for calculation
    total: { type: Number, default: 0 },

}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);