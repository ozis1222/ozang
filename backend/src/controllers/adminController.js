const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    const [
      totalUsers, totalStores, totalProducts, totalOrders,
      monthlyOrders, todayOrders, totalRevenue, pendingOrders,
      disputedOrders, newUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$commission' } } }]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'disputed' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    const recentOrders = await Order.find()
      .populate('buyer', 'name avatar')
      .populate('seller', 'name')
      .populate('product', 'title')
      .sort('-createdAt').limit(10);

    const recentUsers = await User.find().sort('-createdAt').limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers, totalStores, totalProducts, totalOrders,
        monthlyOrders, todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders, disputedOrders, newUsers,
      },
      recentOrders,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isBanned } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Admin engellenemez' });
    user.isBanned = !user.isBanned;
    user.banReason = req.body.reason;
    await user.save();
    res.json({ success: true, message: user.isBanned ? 'Kullanıcı engellendi' : 'Engel kaldırıldı', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, { isVerified: !store?.isVerified }, { new: true });
    if (!store) return res.status(404).json({ success: false, message: 'Mağaza bulunamadı' });
    res.json({ success: true, store });
  } catch (err) {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Mağaza bulunamadı' });
    store.isVerified = !store.isVerified;
    await store.save();
    res.json({ success: true, store });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isApproved: req.body.approved }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
    order.dispute.resolution = req.body.resolution;
    order.dispute.resolvedAt = new Date();
    order.status = req.body.status;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Kategori silindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
