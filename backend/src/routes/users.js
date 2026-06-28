const router = require('express').Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -wallet -stripeCustomerId');
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'phone', 'location', 'avatar', 'notifications'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(400).json({ success: false, message: 'Mevcut şifre yanlış' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Şifre güncellendi' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/wallet', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet');
    const transactions = await Transaction.find({ user: req.user.id }).sort('-createdAt').limit(20).populate('order', 'orderNumber');
    res.json({ success: true, balance: user.wallet, transactions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: [{ path: 'category', select: 'name' }, { path: 'seller', select: 'name avatar' }, { path: 'store', select: 'name logo slug' }],
    });
    res.json({ success: true, products: user.favorites });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
