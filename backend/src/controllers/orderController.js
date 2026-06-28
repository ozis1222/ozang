const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const wallet = require('../services/walletService');
const { createNotification } = require('../services/notificationService');

const COMMISSION = parseFloat(process.env.COMMISSION_RATE || 0.07);

exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity = 1, paymentMethod, deliveryInfo, notes } = req.body;
    const product = await Product.findById(productId).populate('store');
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    }
    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Kendi ürününüzü satın alamazsınız' });
    }
    if (product.stock.status === 'out_of_stock' || product.stock.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Yetersiz stok' });
    }

    const totalAmount = product.price * quantity;
    const commission = totalAmount * COMMISSION;
    const sellerEarning = totalAmount - commission;

    if (paymentMethod === 'wallet') {
      if (req.user.wallet < totalAmount) {
        return res.status(400).json({ success: false, message: 'Yetersiz cüzdan bakiyesi' });
      }
    }

    const order = await Order.create({
      buyer: req.user.id,
      seller: product.seller,
      store: product.store?._id,
      product: productId,
      quantity,
      price: product.price,
      totalAmount,
      commission,
      sellerEarning,
      paymentMethod,
      deliveryInfo,
      notes: { buyer: notes },
      status: paymentMethod === 'wallet' ? 'paid' : 'pending',
      paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
    });

    if (paymentMethod === 'wallet') {
      await wallet.debit(req.user.id, totalAmount, `Satın alma: ${product.title}`, {
        type: 'purchase',
        order: order._id,
      });
      await wallet.credit(product.seller, sellerEarning, `Satış: ${product.title}`, {
        type: 'sale',
        order: order._id,
      });

      product.stock.quantity = Math.max(0, product.stock.quantity - quantity);
      if (product.stock.quantity === 0) product.stock.status = 'out_of_stock';
      product.sales += quantity;
      await product.save();

      if (product.store) {
        await Store.findByIdAndUpdate(product.store._id, {
          $inc: { totalSales: quantity, totalRevenue: totalAmount, 'stats.monthlySales': quantity },
        });
      }

      const seller = await User.findById(product.seller);
      if (seller) {
        seller.totalSales += quantity;
        await seller.save();
      }

      await createNotification(req.app.get('io'), {
        userId: product.seller,
        type: 'sale_made',
        title: 'Yeni Satış!',
        message: `"${product.title}" ürününüz satıldı. Kazancınız: ₺${sellerEarning.toFixed(2)}`,
        link: `/orders/${order._id}`,
        data: { orderId: order._id },
      });
    }

    await createNotification(req.app.get('io'), {
      userId: req.user.id,
      type: 'order_placed',
      title: 'Sipariş Oluşturuldu',
      message: `"${product.title}" için siparişiniz oluşturuldu`,
      link: `/orders/${order._id}`,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'title images price')
      .populate('seller', 'name avatar')
      .populate('buyer', 'name avatar');

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role = 'buyer' } = req.query;
    const query = role === 'seller' ? { seller: req.user.id } : { buyer: req.user.id };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('product', 'title images price slug')
      .populate('buyer', 'name avatar')
      .populate('seller', 'name avatar')
      .populate('store', 'name logo slug')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'title images price slug productType')
      .populate('buyer', 'name avatar email')
      .populate('seller', 'name avatar email')
      .populate('store', 'name logo slug');

    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    if (order.buyer._id.toString() !== req.user.id &&
        order.seller._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Erişim yetkiniz yok' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, cancelReason } = req.body;
    const order = await Order.findById(req.params.id).populate('product', 'title');
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });

    const isSeller = order.seller.toString() === req.user.id;
    const isBuyer = order.buyer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    const allowedTransitions = {
      seller: { paid: ['processing'], processing: ['shipped'], shipped: [] },
      buyer: { shipped: ['completed'], paid: ['cancelled'] },
      admin: { pending: ['paid', 'cancelled'], paid: ['cancelled', 'processing'], processing: ['shipped'], shipped: ['completed', 'refunded'], completed: ['refunded'], disputed: ['refunded', 'completed'] },
    };

    let allowed = isAdmin ? allowedTransitions.admin[order.status] : isSeller ? allowedTransitions.seller[order.status] : isBuyer ? allowedTransitions.buyer[order.status] : [];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Bu durum geçişi izinli değil' });
    }

    order.status = status;
    if (trackingNumber) order.deliveryInfo.trackingNumber = trackingNumber;
    if (status === 'shipped') order.deliveryInfo.shippedAt = new Date();
    if (status === 'delivered') order.deliveryInfo.deliveredAt = new Date();
    if (status === 'completed') order.completedAt = new Date();
    if (status === 'cancelled') { order.cancelledAt = new Date(); order.cancelReason = cancelReason; }
    await order.save();

    const notifyUser = isSeller ? order.buyer : order.seller;
    const messages = {
      processing: 'Siparişiniz hazırlanıyor',
      shipped: `Siparişiniz kargoya verildi${trackingNumber ? `. Takip No: ${trackingNumber}` : ''}`,
      completed: 'Sipariş tamamlandı',
      cancelled: 'Sipariş iptal edildi',
      refunded: 'Ödemeniz iade edildi',
    };

    if (messages[status]) {
      await createNotification(req.app.get('io'), {
        userId: notifyUser,
        type: `order_${status === 'processing' ? 'placed' : status}`,
        title: 'Sipariş Güncellendi',
        message: messages[status],
        link: `/orders/${order._id}`,
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.disputeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yok' });
    }
    order.status = 'disputed';
    order.dispute = { isDisputed: true, reason: req.body.reason };
    await order.save();
    res.json({ success: true, message: 'Şikayet oluşturuldu', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
