const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getAuditLogs } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analytics', protect, authorize('admin'), getDashboardAnalytics);
router.get('/logs', protect, authorize('admin'), getAuditLogs);

module.exports = router;
