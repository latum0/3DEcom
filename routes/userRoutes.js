import express from 'express';
import {


  getAllUsers,
  updateUserStatus,
  getUserProfile,
  deleteUser
} from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();



// Protected user routes (authentication required)
router.get('/profile', auth, getUserProfile);
router.put('/:id', auth, updateUserStatus);
router.delete('/:id', auth, deleteUser);
router.get('/clients', auth, getAllUsers);

export default router;
