import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    // The link to Firebase Authentication
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    // A single field for the user's name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    // The field to control access
    role: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;