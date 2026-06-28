const Product = require('../models/Product');
const Store = require('../models/Store');
const Category = require('../models/Category');
const User = require('../models/User');

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 24, sort = '-createdAt', category, subcategory,
      minPrice, maxPrice, condition, productType, search, store, seller,
      status, featured, freeShipping, tag
    } = req.query;

    const query = { isActive: true, isApproved: true };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (condition) query.condition = condition;
    if (productType) query.productType = productType;
    if (store) query.store = store;
    if (seller) query.seller = seller;
    if (featured === 'true') query.isFeatured = true;
    if (freeShipping === 'true') query['shippingInfo.freeShipping'] = true;
    if (tag) query.tags = tag;
    if (status) query['stock.status'] = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .populate('seller', 'name avatar rating ratingCount')
      .populate('store', 'name logo slug isVerified')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { slug: req.params.id }], isActive: true },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('category', 'name slug')
      .populate('seller', 'name avatar rating ratingCount createdAt')
      .populate('store', 'name logo slug isVerified followerCount totalSales');

    if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });

    const isFavorited = req.user ? req.user.favorites?.includes(product._id) : false;
    res.json({ success: true, product, isFavorited });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).json({ success: false, message: 'Geçersiz kategori' });

    const product = await Product.create({
      ...req.body,
      seller: req.user.id,
      store: store?._id,
    });

    if (store) {
      store.productCount += 1;
      await store.save();
    }

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bu ürünü düzenleme yetkiniz yok' });
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bu ürünü silme yetkiniz yok' });
    }
    product.isActive = false;
    await product.save();
    res.json({ success: true, message: 'Ürün silindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
    const user = req.user;
    const idx = user.favorites.indexOf(req.params.id);
    let isFavorited;
    if (idx > -1) {
      user.favorites.splice(idx, 1);
      product.favorites = Math.max(0, product.favorites - 1);
      isFavorited = false;
    } else {
      user.favorites.push(req.params.id);
      product.favorites += 1;
      isFavorited = true;
    }
    await user.save();
    await product.save();
    res.json({ success: true, isFavorited, favoritesCount: product.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isApproved: true, isFeatured: true })
      .populate('category', 'name')
      .populate('seller', 'name avatar')
      .populate('store', 'name logo slug isVerified')
      .limit(12)
      .lean();
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
