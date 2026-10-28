const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  cancelBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Staff and Admin routes
router.get('/', protect, authorize('staff', 'admin'), getAllBookings);
router.put('/:id/status', protect, authorize('staff', 'admin'), updateBookingStatus);

module.exports = router;
