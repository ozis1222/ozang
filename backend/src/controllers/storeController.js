const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

exports.createStore = async (req, res) => {
  try {
    const existing = await Store.findOne({ owner: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'Zaten bir mağazanız var' });
    const nameExists = await Store.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } });
    if (nameExists) return res.status(400).json({ success: false, message: 'Bu mağaza adı zaten kullanılıyor' });
    const store = await Store.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStore = async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { slug: req.params.id }], isActive: true },
      { $inc: { totalViews: 1, 'stats.monthlyViews': 1 } },
      { new: true }
    ).populate('owner', 'name avatar createdAt');

    if (!store) return res.status(404).json({ success: false, message: 'Mağaza bulunamadı' });

    const products = await Product.find({ store: store._id, isActive: true })
      .populate('category', 'name')
      .sort('-createdAt').limit(20).lean();

    const isFollowing = req.user ? store.followers.includes(req.user.id) : false;
    res.json({ success: true, store, products, isFollowing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', search, category } = req.query;
    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    const total = await Store.countDocuments(query);
    const stores = await Store.find(query)
      .populate('owner', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    res.json({ success: true, stores, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: 'Mağazanız bulunamadı' });
    const updated = await Store.findByIdAndUpdate(store._id, req.body, { new: true, runValidators: true });
    res.json({ success: true, store: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Mağaza bulunamadı' });
    if (store.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Kendi mağazanızı takip edemezsiniz' });
    }
    const user = req.user;
    const idx = store.followers.indexOf(req.user.id);
    let isFollowing;
    if (idx > -1) {
      store.followers.splice(idx, 1);
      store.followerCount = Math.max(0, store.followerCount - 1);
      user.followingStores = user.followingStores.filter(s => s.toString() !== store._id.toString());
      isFollowing = false;
    } else {
      store.followers.push(req.user.id);
      store.followerCount += 1;
      user.followingStores.push(store._id);
      isFollowing = true;
      await createNotification(req.app.get('io'), {
        userId: store.owner,
        type: 'store_follower',
        title: 'Yeni Takipçi',
        message: `${user.name} mağazanızı takip etmeye başladı`,
        link: `/stores/${store.slug}`,
      });
    }
    await store.save();
    await user.save();
    res.json({ success: true, isFollowing, followerCount: store.followerCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: 'Henüz bir mağazanız yok' });
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStoreStats = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: 'Mağazanız bulunamadı' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [orders, monthlyOrders, lastMonthOrders, products] = await Promise.all([
      Order.find({ store: store._id, status: 'completed' }),
      Order.find({ store: store._id, status: 'completed', createdAt: { $gte: startOfMonth } }),
      Order.find({ store: store._id, status: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Product.find({ store: store._id, isActive: true }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.sellerEarning, 0);
    const monthlyRevenue = monthlyOrders.reduce((s, o) => s + o.sellerEarning, 0);
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.sellerEarning, 0);

    res.json({
      success: true,
      stats: {
        totalSales: store.totalSales,
        totalRevenue,
        totalViews: store.totalViews,
        followerCount: store.followerCount,
        productCount: products.length,
        monthlyOrders: monthlyOrders.length,
        monthlyRevenue,
        lastMonthOrders: lastMonthOrders.length,
        lastMonthRevenue,
        revenueGrowth: lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 100,
        topProducts: products.sort((a, b) => b.sales - a.sales).slice(0, 5),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
