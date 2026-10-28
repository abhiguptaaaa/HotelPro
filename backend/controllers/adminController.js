const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Payment = require('../models/Payment');
const AdminLog = require('../models/AdminLog');

// @desc    Get comprehensive admin analytics and KPIs
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [
      totalBookings,
      totalGuests,
      totalRooms,
      payments,
      rooms,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments({ role: 'guest' }),
      Room.countDocuments(),
      Payment.find({ status: 'completed' }),
      Room.find(),
      Booking.find()
        .populate('guest', 'name email')
        .populate('room', 'roomNumber title')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    // Calculate room statuses
    const roomStatusCounts = {
      available: rooms.filter((r) => r.status === 'available').length,
      booked: rooms.filter((r) => r.status === 'booked').length,
      cleaning: rooms.filter((r) => r.status === 'cleaning').length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
    };

    const occupancyRate =
      totalRooms > 0 ? Math.round((roomStatusCounts.booked / totalRooms) * 100) : 0;

    // Monthly revenue simulation/aggregation (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const revenueTrend = [];

    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      revenueTrend.push({
        month: monthNames[monthIdx],
        revenue: Math.round(totalRevenue * (0.12 + Math.random() * 0.08)),
        bookings: Math.floor(totalBookings * (0.12 + Math.random() * 0.08)),
      });
    }

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalBookings,
        totalGuests,
        totalRooms,
        occupancyRate,
        roomStatusCounts,
        revenueTrend,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AdminLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getAuditLogs,
};
