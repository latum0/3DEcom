import express from 'express';
import { searchProducts } from '../controllers/searchController.js';

const router = express.Router();

// Using the root path of this router for search.
router.get("/", searchProducts);

export default router;
