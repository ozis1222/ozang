const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, toggleFavorite, getFeatured } = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeatured);
router.get('/:id', optionalAuth, getProduct);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/favorite', protect, toggleFavorite);

module.exports = router;
