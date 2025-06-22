import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, default: null },
  price: { type: Number, min: 0 },
  salePrice: { type: Number, min: 0, default: null },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: [String], default: [] },
  status: { type: String, enum: ['Proposed', 'Approved', 'Rejected'], default: 'Proposed' },

  // only S, M, L
  sizes: {
    type: [String],
    enum: ['S', 'M', 'L'],
    default: ['S', 'M', 'L'],
    required: false
  },

  // limited colors
  colors: {
    type: [String],
    enum: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray'],
    default: ['Black', 'White', 'Blue'],
    required: false
  },


}, { timestamps: true });

export default mongoose.model('Product', productSchema);