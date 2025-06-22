import dotenv from 'dotenv';
dotenv.config();

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Cart from '../models/Cart.js';
import { v4 as uuidv4 } from 'uuid';

// Generate JWTs
const generateAccessToken = (user) => {
  const payload = { user: { id: user._id, role: user.role } };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "2m" }
  );
};

const generateRefreshToken = (user) => {
  const payload = { user: { id: user._id, role: user.role } };
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

// Register controller
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash, role });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set HTTP-only cookies
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 2 // 2 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token (optional: keep max N refresh tokens)
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Merge guest cart with user cart...
    const guestId = req.cookies.guestId;
    if (guestId) {
      const guestCart = await Cart.findOne({ guestId });
      if (guestCart) {
        let userCart = await Cart.findOne({ user: user._id });
        if (!userCart) {
          guestCart.user = user._id;
          guestCart.guestId = undefined;
          await guestCart.save();
        } else {
          guestCart.items.forEach(item => {
            const existing = userCart.items.find(i => i.product.toString() === item.product.toString());
            if (existing) existing.quantity += item.quantity;
            else userCart.items.push(item);
          });
          await userCart.save();
          await Cart.deleteOne({ guestId });
        }
      }
    }

    const { passwordHash, refreshTokens, ...userData } = user.toObject();

    // Set HTTP-only cookies
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 2 // 2 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    // Also return the tokens in JSON for API clients
    return res.json({
      user: userData,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message || error,
    });
  }
};

// Refresh token controller
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
    const user = await User.findById(decoded.user.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Refresh token not recognized" });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Replace old refresh token
    user.refreshTokens = user.refreshTokens.filter((tok) => tok !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set cookies
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 2 // 2 minutes
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// controllers/authController.js
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      if (decoded?.user?.id) {
        const user = await User.findById(decoded.user.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
          await user.save();
        }
      }
    }

    // clear exactly what you set in login/register
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',               // ← this must match
    };
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('guestId', cookieOptions);

    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
