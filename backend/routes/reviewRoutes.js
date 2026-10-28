const express = require('express');
const router = express.Router();
const {
  createReview,
  getRoomReviews,
  getAllReviews,
  respondToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/room/:roomId', getRoomReviews);

// Staff and Admin review moderation & reply
router.get('/', protect, authorize('staff', 'admin'), getAllReviews);
router.post('/:id/respond', protect, authorize('staff', 'admin'), respondToReview);

module.exports = router;
