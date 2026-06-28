const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, maxlength: 1000 },
  logo: { type: String, default: null },
  banner: { type: String, default: null },
  category: { type: String },
  tags: [String],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followerCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0.07 },
  socialLinks: {
    instagram: String,
    twitter: String,
    website: String,
  },
  policies: {
    returnPolicy: { type: String, default: '' },
    shippingPolicy: { type: String, default: '' },
  },
  stats: {
    monthlyViews: { type: Number, default: 0 },
    monthlySales: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
}, { timestamps: true });

storeSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

storeSchema.virtual('averageRating').get(function () {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

module.exports = mongoose.model('Store', storeSchema);
