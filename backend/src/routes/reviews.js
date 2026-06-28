const router = require('express').Router();
const { createReview, getReviews, respondToReview, voteHelpful } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', protect, createReview);
router.put('/:id/respond', protect, respondToReview);
router.post('/:id/helpful', protect, voteHelpful);

module.exports = router;
