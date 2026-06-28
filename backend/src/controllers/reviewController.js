const Review = require('../models/Review');
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');
const Order = require('../models/Order');

const updateRating = async (model, id, field) => {
  const reviews = await Review.find({ [field]: id, isHidden: false });
  const avg = reviews.reduce((s, r) => s + r.rating, 0);
  await model.findByIdAndUpdate(id, { rating: avg, ratingCount: reviews.length });
};

exports.createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, title, comment, orderId } = req.body;
    if (targetType === 'product') {
      const existing = await Review.findOne({ reviewer: req.user.id, product: targetId });
      if (existing) return res.status(400).json({ success: false, message: 'Bu ürünü zaten değerlendirdiniz' });
      const order = orderId ? await Order.findById(orderId) : null;
      const review = await Review.create({
        reviewer: req.user.id,
        targetType,
        product: targetId,
        order: orderId,
        rating,
        title,
        comment,
        isVerifiedPurchase: order?.buyer.toString() === req.user.id && order?.status === 'completed',
      });
      await updateRating(Product, targetId, 'product');
      await review.populate('reviewer', 'name avatar');
      return res.status(201).json({ success: true, review });
    }
    if (targetType === 'store') {
      const existing = await Review.findOne({ reviewer: req.user.id, store: targetId });
      if (existing) return res.status(400).json({ success: false, message: 'Bu mağazayı zaten değerlendirdiniz' });
      const review = await Review.create({ reviewer: req.user.id, targetType, store: targetId, rating, title, comment });
      await updateRating(Store, targetId, 'store');
      await review.populate('reviewer', 'name avatar');
      return res.status(201).json({ success: true, review });
    }
    res.status(400).json({ success: false, message: 'Geçersiz hedef tipi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { type, targetId, page = 1, limit = 10 } = req.query;
    const query = { isHidden: false };
    if (type === 'product') query.product = targetId;
    else if (type === 'store') query.store = targetId;
    else if (type === 'user') query.targetUser = targetId;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ success: true, reviews, total, avgRating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('store');
    if (!review) return res.status(404).json({ success: false, message: 'Yorum bulunamadı' });
    if (review.store?.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yok' });
    }
    review.sellerResponse = { text: req.body.response, createdAt: new Date() };
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.voteHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Yorum bulunamadı' });
    const idx = review.helpfulVotes.indexOf(req.user.id);
    idx > -1 ? review.helpfulVotes.splice(idx, 1) : review.helpfulVotes.push(req.user.id);
    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulVotes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
