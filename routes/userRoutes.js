import express from 'express';
import {
  loginUser,
  registerUser,
  getAllUsers,
  updateUserStatus,
  getUserProfile,
  deleteUser
} from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Public user routes
router.post('/login', loginUser);
router.post('/signup', registerUser);

// Protected user routes (authentication required)
router.get('/profile', auth, getUserProfile);
router.put('/:id', auth, updateUserStatus);
router.delete('/:id', auth, deleteUser);
router.get('/clients', auth, getAllUsers);

export default router;
