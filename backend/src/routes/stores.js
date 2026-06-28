const router = require('express').Router();
const { createStore, getStore, getStores, updateStore, toggleFollow, getMyStore, getStoreStats } = require('../controllers/storeController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', getStores);
router.get('/my', protect, getMyStore);
router.get('/my/stats', protect, getStoreStats);
router.post('/', protect, createStore);
router.get('/:id', optionalAuth, getStore);
router.put('/', protect, updateStore);
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
