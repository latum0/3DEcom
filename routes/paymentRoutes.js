import express from 'express';
import Payment from '../models/Payment.js';

const router = express.Router();

// GET all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ transactionDate: -1 });
    
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Aucun paiement trouvé' });
    }
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// CREATE new payment
router.post('/', async (req, res) => {
  try {
    const { vendor, amount, method, reference } = req.body;

    // Validation
    if (!vendor || !amount || !method) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const paymentData = {
      vendor: {
        name: vendor.name,
        email: vendor.email,
        bankAccount: vendor.bankAccount || ''
      },
      amount,
      method,
      status: 'Initiated',
      reference: reference || `PAY-${Date.now()}`,
      transactionDate: new Date()
    };

    const payment = new Payment(paymentData);
    const savedPayment = await payment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erreur création paiement',
      details: error.message 
    });
  }
});

export default router;