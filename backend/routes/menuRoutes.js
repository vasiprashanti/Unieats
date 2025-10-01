import express from "express";
import {
  getVendorMenu,
  createCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from "../controllers/menuController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/fileUpload.js";

const router = express.Router();
const authenticated = [verifyFirebaseToken];

// ===== MENU ROUTES =====
// GET vendor's complete menu (categories + items + stats)
router.get("/", ...authenticated, getVendorMenu);

// CREATE a new category
router.post("/categories", ...authenticated, createCategory);

// CREATE a new menu item
router.post("/", ...authenticated, uploadImage.single("image"), createMenuItem);

// UPDATE a menu item
router.put(
  "/:id",
  ...authenticated,
  uploadImage.single("image"),
  updateMenuItem
);

// DELETE a menu item
router.delete("/:id", ...authenticated, deleteMenuItem);

// TOGGLE menu item availability
router.patch("/:id/availability", ...authenticated, toggleAvailability);

export default router;
