import express from 'express';
import {
    createCategory,
    deleteCategory,
    deleteCategoryPermanently,
    getAllCategories,
    getActiveCategories,
    updateCategory
} from '../controllers/categoryController.js';
import admin from '../middlewares/admin.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Admin routes
router.post('/', auth, admin, createCategory); // Create a new category
router.put('/:categoryId', auth, admin, updateCategory);
router.delete('/:categoryId', auth, admin, deleteCategory); // Soft delete a category
router.delete('/:categoryId/permanent', auth, admin, deleteCategoryPermanently); // Hard delete a category

// Public routes
router.get('/', getAllCategories); // Fetch all categories
router.get('/active', getActiveCategories); // Fetch only active categories

export default router;