const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Notification.countDocuments({ user: req.user.id });
    const unread = await Notification.countDocuments({ user: req.user.id, isRead: false });
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, notifications, total, unread });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
