import express from 'express';
import * as cartCtrl from '../controllers/cartController.js';
import { ensureGuestId } from '../middlewares/guestId.js';

const router = express.Router();

router.post('/', ensureGuestId, cartCtrl.addToCart);
router.get('/', ensureGuestId, cartCtrl.getCart);
router.delete('/', ensureGuestId, cartCtrl.removeFromCart);
router.delete('/clear', ensureGuestId, cartCtrl.clearCart);


export default router;