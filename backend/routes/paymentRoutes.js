const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPaymentByBooking,
  getAllPayments,
  getInvoice,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/process', protect, processPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);
router.get('/invoice/:bookingId', protect, getInvoice);

// Staff/Admin access
router.get('/', protect, authorize('staff', 'admin'), getAllPayments);

module.exports = router;
