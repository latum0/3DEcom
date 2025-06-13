// controllers/userController.js
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Generate token using same payload format.
const generateAuthToken = (user) => {
  return jwt.sign(
    { user: { id: user._id, role: user.role } },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// POST /signup
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) 
      return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      address,
      phone
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const { passwordHash, ...userData } = user.toObject();
    res.json({ token: generateAuthToken(user), user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /profile (Get User Profile)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message || error });
  }
};

// GET /clients
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message || error });
  }
};

// PUT /:id (Update User Status)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message || error });
  }
};

// DELETE /:id (Delete User)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message || error });
  }
};
