import User from "../models/User.model.js"; // Import the User model
import { validationResult } from "express-validator";

// REGISTRATION CONTROLLER
const registerUser = async (req, res) => {
  const {
    firebaseUid,
    email,
    phone,
    name, // { first, last }
    yearOfStudy,
    accommodation,
    hostelDetails, // { block, room }
    offCampusAddress, // { addressLine1, landmark }
  } = req.body;

  // Basic validation
  if (!firebaseUid || !email || !phone || !name || !accommodation) {
    return res
      .status(400)
      .json({ message: "Missing required fields for registration." });
  }

  // Additional validation only for HOSTELLERS
  if (accommodation === "Hosteller" && !yearOfStudy) {
    return res
      .status(400)
      .json({ message: "Year of study is required for hostellers." });
  }

  // Additional validation only for NON-HOSTELLERS
  if (accommodation === "Non-Hosteller" && !offCampusAddress) {
    return res
      .status(400)
      .json({ message: "Address is required for non-hostellers." });
  }

  try {
    let user = await User.findOne({ $or: [{ email }, { firebaseUid }] });

    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    const newUserPayload = {
      firebaseUid,
      email,
      phone,
      name,
      accommodation,
    };

    // If Hosteller
    if (accommodation === "Hosteller") {
      newUserPayload.yearOfStudy = yearOfStudy;
      newUserPayload.hostelDetails = hostelDetails;
      console.log("🏠 Hosteller Payload:", newUserPayload);
    }

    // If Non-Hosteller
    if (accommodation === "Non-Hosteller") {
      newUserPayload.addresses = [
        {
          label: "Home",
          addressLine1: offCampusAddress.addressLine1 || "",
          landmark: offCampusAddress.landmark || "",
          city: offCampusAddress.city || "",
          state: offCampusAddress.state || "",
          zipCode: offCampusAddress.zipCode || "",
        },
      ];
    }

    user = new User(newUserPayload);
    await user.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration." });
  }
};

// GET USER PROFILE CONTROLLER
const getMe = async (req, res) => {
  try {
    // The user's firebaseUid is attached to req.user by the middleware
    const firebaseUid = req.user.firebaseUid;
    // Find the user in your MongoDB by their firebaseUid
    const user = await User.findOne({ firebaseUid }).select("-password"); // .select('-password') is good practice
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in our database." });
    }

    // Send the user profile back
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const verifyToken = (req, res) => {
  // The 'verifyFirebaseToken' middleware has already done all the work.
  // If we reach this point, the token is valid and req.user is populated.
  // We just send back the user data as confirmation.
  res.status(200).json({
    message: "Token is valid.",
    user: req.user,
  });
};

export { registerUser, getMe, verifyToken };
