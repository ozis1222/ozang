const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['product', 'store', 'user'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 100 },
  comment: { type: String, required: true, maxlength: 1000 },
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isHidden: { type: Boolean, default: false },
  sellerResponse: {
    text: String,
    createdAt: Date,
  },
}, { timestamps: true });

reviewSchema.index({ product: 1, reviewer: 1 }, { sparse: true });
reviewSchema.index({ store: 1, reviewer: 1 }, { sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
