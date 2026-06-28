const router = require('express').Router();
const { createPaymentIntent, webhookHandler, depositToWallet, withdrawFromWallet, getTransactions } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/webhook', webhookHandler);
router.use(protect);
router.post('/create-intent', createPaymentIntent);
router.post('/deposit', depositToWallet);
router.post('/withdraw', withdrawFromWallet);
router.get('/transactions', getTransactions);

module.exports = router;
