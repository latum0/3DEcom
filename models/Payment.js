import mongoose from 'mongoose';

const { Schema } = mongoose;

const paymentSchema = new Schema({
  vendor: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    bankAccount: String
  },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: {
    type: String,
    enum: ['Initiated', 'Success', 'Failed', 'Refunded'],
    default: 'Initiated'
  },
  reference: { type: String, unique: true },
  transactionDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);