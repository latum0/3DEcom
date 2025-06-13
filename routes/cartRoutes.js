import express from 'express';
import { auth } from '../middlewares/auth.js'; // Assurez-vous que ce middleware fonctionne
import * as cartCtrl from '../controllers/cartController.js';

const router = express.Router();

router.post('/', auth, cartCtrl.addToCart); // Ajouter un produit
router.get('/', auth, cartCtrl.getCart);    // Récupérer le panier
router.delete('/', auth, cartCtrl.removeFromCart); // Supprimer un produit

export default router;