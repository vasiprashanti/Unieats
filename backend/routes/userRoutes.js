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
// GET current user's profile
// userRouter.get("/me", verifyFirebaseToken, getMe);

// UPDATE current user's profile
userRouter.put("/me", verifyFirebaseToken, updateMe);

// === ADDRESS MANAGEMENT ROUTES ===
// GET all addresses
userRouter.get("/addresses", verifyFirebaseToken, getAddresses);

// ADD new address
userRouter.post("/addresses", verifyFirebaseToken, addAddress);

// UPDATE address by ID
userRouter.put("/addresses/:id", verifyFirebaseToken, updateAddress);

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
userRouter.post("/favorites/:vendorId", verifyFirebaseToken, toggleFavorite);

export default userRouter;
