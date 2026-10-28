const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  updateServiceRequest,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createServiceRequest);
router.get('/my', protect, getMyServiceRequests);

// Staff and Admin routes
router.get('/', protect, authorize('staff', 'admin'), getAllServiceRequests);
router.put('/:id', protect, authorize('staff', 'admin'), updateServiceRequest);

module.exports = router;
