const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true, maxlength: 5000 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  discountPercent: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String },
  tags: [String],
  images: [{ url: String, publicId: String }],
  stock: {
    status: { type: String, enum: ['available', 'limited', 'out_of_stock'], default: 'available' },
    quantity: { type: Number, default: 1 },
  },
  productType: {
    type: String,
    enum: ['physical', 'digital', 'game_item', 'service'],
    default: 'physical',
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    default: 'new',
  },
  deliveryType: {
    type: String,
    enum: ['instant', 'manual', 'shipping'],
    default: 'manual',
  },
  digitalContent: { type: String, select: false },
  specifications: [{ key: String, value: String }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  shippingInfo: {
    weight: Number,
    dimensions: String,
    freeShipping: { type: Boolean, default: false },
    shippingCost: { type: Number, default: 0 },
  },
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const base = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.slug = `${base}-${Date.now()}`;
  }
  if (this.originalPrice && this.price < this.originalPrice) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1, rating: -1 });
productSchema.index({ seller: 1, store: 1 });

module.exports = mongoose.model('Product', productSchema);
