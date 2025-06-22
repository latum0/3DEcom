import Category from '../models/category.js';
import Product from '../models/Product.js';

/**
 * Create a new category
 * Only accessible to admins
 */
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Create the new category
        const category = new Category({ name, description });
        await category.save();

        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Soft delete a category
 * Marks the category as inactive but does not remove it from the database
 */
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Find the category
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Perform a soft delete
        category.isActive = false;
        await category.save();

        res.status(200).json({ message: 'Category deleted successfully (soft delete)', category });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Hard delete a category
 * Permanently removes the category from the database
 * Ensures no products are associated with the category before deletion
 */
export const deleteCategoryPermanently = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Check if the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check if any products are linked to this category
        const linkedProducts = await Product.find({ category: categoryId });
        if (linkedProducts.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete category. It is linked to existing products.',
                linkedProducts
            });
        }

        // Perform a hard delete
        await Category.findByIdAndDelete(categoryId);

        res.status(200).json({ message: 'Category deleted successfully (hard delete)' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Fetch all categories
 * Includes both active and inactive categories
 */
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Fetch active categories only
 * Useful for filtering categories available for product creation
 */
export const getActiveCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// controllers/categoryController.js

export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, isActive, customNameAllowed } = req.body;
        const updated = await Category.findByIdAndUpdate(
            categoryId,
            { name, isActive, customNameAllowed },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Catégorie introuvable' });
        res.json({ data: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    }
};
