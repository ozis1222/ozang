const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const wallet = require('../services/walletService');
const { createNotification } = require('../services/notificationService');

const COMMISSION = parseFloat(process.env.COMMISSION_RATE || 0.07);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });

    const amount = Math.round(product.price * quantity * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'try',
      metadata: { productId, quantity: String(quantity), buyerId: req.user.id },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret, amount: product.price * quantity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: pi.id });
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'paid';
      await order.save();

      const product = await Product.findById(order.product);
      const sellerEarning = order.sellerEarning;

      await wallet.credit(order.seller, sellerEarning, `Satış geliri: Sipariş ${order.orderNumber}`, {
        type: 'sale', order: order._id,
      });

      if (order.store) {
        await Store.findByIdAndUpdate(order.store, {
          $inc: { totalSales: order.quantity, totalRevenue: order.totalAmount },
        });
      }

      await createNotification(null, {
        userId: order.seller,
        type: 'sale_made',
        title: 'Ödeme Alındı!',
        message: `Sipariş #${order.orderNumber} için ödeme alındı`,
        link: `/orders/${order._id}`,
      });
    }
  }
  res.json({ received: true });
};

exports.depositToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount < 10) return res.status(400).json({ success: false, message: 'Minimum yükleme tutarı ₺10' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'try',
      metadata: { type: 'wallet_deposit', userId: req.user.id },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.withdrawFromWallet = async (req, res) => {
  try {
    const { amount, iban, accountName } = req.body;
    const min = parseFloat(process.env.MIN_WITHDRAWAL || 50);
    if (amount < min) return res.status(400).json({ success: false, message: `Minimum çekim tutarı ₺${min}` });
    if (req.user.wallet < amount) return res.status(400).json({ success: false, message: 'Yetersiz bakiye' });

    await wallet.debit(req.user.id, amount, `Para çekimi: ${iban}`, {
      type: 'withdrawal',
      metadata: { iban, accountName },
    });

    res.json({ success: true, message: 'Çekim talebiniz alındı. 1-3 iş günü içinde hesabınıza aktarılacaktır.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { user: req.user.id };
    if (type) query.type = type;
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('order', 'orderNumber')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, transactions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
