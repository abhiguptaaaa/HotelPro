const express = require('express');
const router = express.Router();
const {
  checkInGuest,
  checkOutGuest,
  updateRoomStatus,
  getOperationsOverview,
} = require('../controllers/operationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/check-in', protect, authorize('staff', 'admin'), checkInGuest);
router.post('/check-out', protect, authorize('staff', 'admin'), checkOutGuest);
router.put('/room/:roomId/status', protect, authorize('staff', 'admin'), updateRoomStatus);
router.get('/overview', protect, authorize('staff', 'admin'), getOperationsOverview);

module.exports = router;
