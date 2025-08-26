import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true }, // Indexed for fast lookups
    email: { type: String, required: true, unique: true, lowercase: true, index: true }, // Indexed for fast lookups
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user', index: true }, // Indexed for filtering by role
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
