const { Schema: CmsSchema, model: CmsModel } = require('mongoose');

const commentSchema = new CmsSchema({
  product: { type: CmsSchema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: CmsSchema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = CmsModel('Comment', commentSchema);