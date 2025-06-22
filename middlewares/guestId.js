// middlewares/guestId.js
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Middleware to authenticate user via JWT or assign guestId
export function ensureGuestId(req, res, next) {
    const auth = req.headers.authorization;

    // 1) If there's a Bearer token, verify it first
    if (auth && auth.startsWith('Bearer ')) {
        const token = auth.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            // Attach user info to request
            req.user = { _id: payload.id };
            // Clear guestId cookie if present
            if (req.cookies.guestId) {
                res.clearCookie('guestId', { path: '/', httpOnly: true });
            }
            return next();
        } catch (err) {
            console.warn('Invalid JWT in ensureGuestId:', err.message);
            // Continue as guest
        }
    }

    // 2) For guests, ensure a guestId cookie exists
    if (!req.cookies.guestId) {
        const id = uuidv4();
        res.cookie('guestId', id, {
            httpOnly: true,
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        req.cookies.guestId = id;
    }

    next();
}
