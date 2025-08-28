import mongoose, {Schema} from 'mongoose';

const prelaunchUserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'],
    },
}, { timestamps: true });

const PrelaunchUser = mongoose.model('PrelaunchUser', prelaunchUserSchema);
export default PrelaunchUser;