// controllers/paymentController.js
const Payment = require('../models/Payment');

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email') // assure-toi que le champ 'user' existe
      .sort({ transactionDate: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements :', error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des paiements." });
  }
};

module.exports = {
  getAllPayments,
};
