import express from "express";
import {
  createProductAdmin,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
  proposeProduct,
  reviewProposedProduct,
} from "../controllers/productController.js";
import { auth } from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";

const router = express.Router();

// Order here matters—specific routes must come before generic ones
router.get("/", auth, admin, getProducts); // Get all products
router.get("/:id", auth, admin, getProductById); // Get product by ID
router.post("/", auth, admin, createProductAdmin); // Create a new product (admin only)
router.put("/:id", auth, admin, updateProduct); // Update a product (admin only)
router.delete("/:id", auth, admin, deleteProduct); // Delete a product (admin only)

// New routes for proposing and reviewing products
router.post("/propose", auth, proposeProduct); // Propose a product (clients only)
router.put("/:id/review", auth, admin, reviewProposedProduct); // Review a product proposal (admin only)

export default router;