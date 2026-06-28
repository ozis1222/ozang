const router = require('express').Router();
const { createOrder, getOrders, getOrder, updateOrderStatus, disputeOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
router.post('/:id/dispute', disputeOrder);

module.exports = router;
