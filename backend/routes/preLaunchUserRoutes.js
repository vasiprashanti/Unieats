import express from "express";
import PrelaunchUser from "../models/preLaunchUser.model.js";

const router = express.Router();

// POST /api/v1/prelaunch/signup
router.post("/signup", async (req, res) => {
  try {
    // Get the name, email, and phone from the incoming request's body
    const { name, email, phone } = req.body;

    // Validation
    // Ensure no essential data is missing before proceeding.
    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and phone number." });
    }

    // Create a new user document based on our PrelaunchUser model
    const newSignup = new PrelaunchUser({
      name,
      email,
      phone,
    });

    // Save to Database
    // Asynchronously save the new document to MongoDB
    await newSignup.save();

    // Send Success Response
    // Send a 201 "Created" status and a success message back to the user.
    res.status(201).json({
      message: "Thank you for signing up! We will be in touch.",
      data: newSignup,
    });
  } catch (error) {
    // Error Handling: The Safety Net
    // This block runs if anything in the 'try' block fails.

    // Specifically handle the duplicate email error
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "This email address has already been registered." });
    }

    // Handle other validation errors (e.g., invalid phone number)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    // For any other unexpected errors, send a generic server error message.
    console.error(error); // Log the actual error for your own debugging
    res
      .status(500)
      .json({ message: "An unexpected error occurred. Please try again." });
  }
});

// GET all pre-launch signups (GET /api/v1/prelaunch/users)
router.get("/users", async (req, res) => {
  try {
    // Find all documents using the PrelaunchUser model and sort by newest first
    const users = await PrelaunchUser.find().sort({ createdAt: -1 });

    // Send the list of users back as a JSON response
    res.status(200).json({ count: users.length, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
});

export default router;
