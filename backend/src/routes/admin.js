const router = require('express').Router();
const { getDashboard, getUsers, banUser, verifyStore, approveProduct, resolveDispute, createCategory, updateCategory, deleteCategory } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/ban', banUser);
router.put('/stores/:id/verify', verifyStore);
router.put('/products/:id/approve', approveProduct);
router.put('/orders/:id/resolve', resolveDispute);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
