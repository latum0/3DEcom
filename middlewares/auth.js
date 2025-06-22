// middlewares/identifyUser.js
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

/**
 * Identify middleware:
 * - If valid JWT in Bearer or cookie, attaches req.user
 * - Otherwise ensures a guestId cookie and leaves req.user undefined
 */
export const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  let token = null;

  // 1) Try cookie token
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2) Try Bearer header
  else if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.user && decoded.user.id) {
        // Authenticated user
        req.user = { _id: decoded.user.id, role: decoded.user.role };
        // Remove any leftover guestId cookie
        if (req.cookies.guestId) {
          res.clearCookie('guestId', { path: '/', httpOnly: true });
        }
        return next();
      }
    } catch (err) {
      console.warn('Invalid JWT in identifyUser:', err.message);
      // fall through as guest
    }
  }

  // No valid token: treat as guest
  if (!req.cookies.guestId) {
    const newId = uuidv4();
    res.cookie('guestId', newId, {
      httpOnly: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    req.cookies.guestId = newId;
  }

  next();
};