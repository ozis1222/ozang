const router = require('express').Router();
const Category = require('../models/Category');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true, parent: null }).sort('order name');
    res.json({ success: true, categories });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id/subcategories', async (req, res) => {
  try {
    const subs = await Category.find({ parent: req.params.id, isActive: true }).sort('order name');
    res.json({ success: true, subcategories: subs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
