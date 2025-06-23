import express from 'express';
import * as cartCtrl from '../controllers/cartController.js';

import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth, cartCtrl.addToCart);
router.get('/', auth, cartCtrl.getCart);
router.delete('/', auth, cartCtrl.removeFromCart);
router.delete('/clear', auth, cartCtrl.clearCart);


export default router;