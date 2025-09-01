import User from '../models/User.model.js'; // Import the User model
import { validationResult } from 'express-validator';

// REGISTRATION CONTROLLER 
const registerUser = async (req, res) => {
  // Check for validation errors first
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure the required fields from the request body
  const { name, email, firebaseUid } = req.body;

  try {
    // Check if a user with this email or firebaseUid already exists
    let user = await User.findOne({ $or: [{ email }, { firebaseUid }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Create a new user instance from the model
    user = new User({
      name,
      email,
      firebaseUid,
    });

    // Save the new user to the database
    await user.save();

    // Send back a success response
    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// GET USER PROFILE CONTROLLER
const getMe = async (req, res) => {
  try {
    // The user's firebaseUid is attached to req.user by the middleware
    const firebaseUid = req.user.uid;

    // Find the user in your MongoDB by their firebaseUid
    const user = await User.findOne({ firebaseUid }).select('-password'); // .select('-password') is good practice

    if (!user) {
      return res.status(404).json({ message: 'User not found in our database.' });
    }

    // Send the user profile back
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const verifyToken = (req, res) => {
  // The 'verifyFirebaseToken' middleware has already done all the work.
  // If we reach this point, the token is valid and req.user is populated.
  // We just send back the user data as confirmation.
  res.status(200).json({
    message: 'Token is valid.',
    user: req.user
  });
};


export { registerUser, getMe, verifyToken };