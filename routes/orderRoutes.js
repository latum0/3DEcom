import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  createOrder,
  getBuyerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderByContact // New function
} from '../controllers/orderController.js';
import admin from '../middlewares/admin.js';
import { ensureGuestId } from '../middlewares/guestId.js';

const router = express.Router();

// Buyer creates an order
router.post('/', auth, createOrder);

// For admin to retrieve all orders
router.get('/', auth, admin, getAllOrders);

// Retrieve an order by email or phone (admin-only access)
// This route must come BEFORE the `/:orderId` route
router.get('/contact', auth, admin, getOrderByContact);

// Get orders for the currently authenticated buyer
router.get('/buyer', auth, getBuyerOrders);

// Retrieve a single order by its ID
router.get('/:orderId', auth, getOrderById);

// Update the status of an order (admin)
router.put('/:orderId/status', auth, admin, updateOrderStatus);

// Cancel an order (only if its status is 'Pending')
router.delete('/:orderId/cancel', auth, admin, cancelOrder);

export default router;