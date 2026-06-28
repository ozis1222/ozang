const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, default: () => `ORD-${uuidv4().split('-')[0].toUpperCase()}` },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  commission: { type: Number, required: true },
  sellerEarning: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'disputed'],
    default: 'pending',
  },
  paymentMethod: { type: String, enum: ['card', 'wallet', 'bank_transfer'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
  stripePaymentIntentId: String,
  deliveryInfo: {
    address: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'TR' },
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
  },
  digitalDelivery: {
    content: { type: String, select: false },
    deliveredAt: Date,
  },
  notes: { buyer: String, seller: String },
  dispute: {
    isDisputed: { type: Boolean, default: false },
    reason: String,
    resolution: String,
    resolvedAt: Date,
  },
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
