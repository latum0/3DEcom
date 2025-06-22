import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, required: true },
  size: { type: String, required: false, default: 's' },
  color: { type: String, required: false, default: 'black' },
  customName: { type: String, require: true },
});

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  guestId: { type: String },
  items: [cartItemSchema],
}, { timestamps: true });

cartSchema.index({ user: 1 }, { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } });
cartSchema.index({ guestId: 1 }, { unique: true, partialFilterExpression: { guestId: { $type: 'string' } } });

export default model('Cart', cartSchema);