import express from "express";
import { check, validationResult } from "express-validator";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import {
  // getMe,
  updateMe,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  toggleFavorite,
} from "../controllers/userController.js";

const userRouter = express.Router();

// === PROFILE ROUTES ===
// UPDATE current user's profile
userRouter.put(
  "/me",
  verifyFirebaseToken,
  [
    check("name", "Name is required").optional().not().isEmpty(),
    check("email", "Please include a valid email").optional().isEmail(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateMe
);

// === ADDRESS MANAGEMENT ROUTES ===
// GET all addresses
userRouter.get("/addresses", verifyFirebaseToken, getAddresses);

// ADD new address
userRouter.post(
  "/addresses",
  verifyFirebaseToken,
  [
    check("street", "Street is required").not().isEmpty(),
    check("city", "City is required").not().isEmpty(),
    check("state", "State is required").not().isEmpty(),
    check("zipCode", "Zip code is required").not().isEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  addAddress
);

// UPDATE address by ID
userRouter.put(
  "/addresses/:id",
  verifyFirebaseToken,
  [
    check("street", "Street is required").optional().not().isEmpty(),
    check("city", "City is required").optional().not().isEmpty(),
    check("state", "State is required").optional().not().isEmpty(),
    check("zipCode", "Zip code is required").optional().not().isEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateAddress
);

// DELETE address by ID
userRouter.delete("/addresses/:id", verifyFirebaseToken, deleteAddress);

// SET default address
userRouter.patch(
  "/addresses/:id/default",
  verifyFirebaseToken,
  setDefaultAddress
);

// === FAVORITES ROUTES ===
// TOGGLE favorite restaurant
userRouter.patch("/favorites/:vendorId", verifyFirebaseToken, toggleFavorite);

export default userRouter;
