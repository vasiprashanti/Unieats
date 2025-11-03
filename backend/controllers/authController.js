import User from "../models/User.model.js"; // Import the User model
import { validationResult } from "express-validator";

// REGISTRATION CONTROLLER
const registerUser = async (req, res) => {
    //  BREADCRUMB 1: Did we get the request? 
    console.log(" registerUser function STARTED ");
    console.log("Received body:", JSON.stringify(req.body, null, 2));

    const {
        firebaseUid,
        email,
        phone,
        name,
        yearOfStudy,
        accommodation,
        hostelDetails,
        offCampusAddress,
    } = req.body;

    //  BREADCRUMB 2: Basic Validation 
    if (!firebaseUid || !email || !phone || !name || !accommodation) {
        console.log("Validation FAILED: Missing required fields (firebaseUid, email, phone, name, or accommodation).");
        return res
            .status(400)
            .json({ message: "Missing required fields for registration." });
    }

    //  BREADCRUMB 3: Hosteller Validation 
    if (accommodation === "Hosteller" && !yearOfStudy) {
        console.log("Validation FAILED: Hosteller is missing yearOfStudy.");
        return res
            .status(400)
            .json({ message: "Year of study is required for hostellers." });
    }

    //  BREADCRUMB 4: Non-Hosteller Validation 
    if (accommodation === "Non-Hosteller" && !offCampusAddress) {
        console.log("Validation FAILED: Non-Hosteller is missing offCampusAddress.");
        return res
            .status(400)
            .json({ message: "Address is required for non-hostellers." });
    }

    try {
        //  BREADCRUMB 5: Check Database 
        console.log(`Checking if user exists for email: ${email} OR firebaseUid: ${firebaseUid}`);
        let user = await User.findOne({ $or: [{ email }, { firebaseUid }] });

        if (user) {
            console.log("Validation FAILED: User already exists in database.");
            return res.status(400).json({ message: "User already exists." });
        }

        console.log("User does not exist. Building new user payload...");
        const newUserPayload = {
            firebaseUid,
            email,
            phone,
            name,
            accommodation,
        };

        if (accommodation === "Hosteller") {
            newUserPayload.yearOfStudy = yearOfStudy;
            newUserPayload.hostelDetails = hostelDetails;
            console.log("Hosteller Payload built:", newUserPayload);
        }

        if (accommodation === "Non-Hosteller") {
            // This is the structure from your User model
            newUserPayload.addresses = [
                {
                    label: "Home", // Default label
                    addressLine1: offCampusAddress.addressLine1 || "",
                    landmark: offCampusAddress.landmark || "",
                    city: offCampusAddress.city || "",
                    state: offCampusAddress.state || "",
                    zipCode: offCampusAddress.zipCode || "",
                },
            ];
            console.log("Non-Hosteller Payload built:", newUserPayload);
        }

        //  BREADCRUMB 6: Save to Database 
        console.log("Attempting to save new user to MongoDB...");
        user = new User(newUserPayload);
        await user.save();
        console.log("User saved successfully! ID:", user._id);

        //  BREADCRUMB 7: Send Success Response 
        res.status(201).json({
            message: "User registered successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
        console.log(" registerUser function FINISHED successfully ");

    } catch (error) {
        // This is the most important log. This will show us if the .save() fails.
        console.error("CRITICAL ERROR in registerUser:", error);
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
