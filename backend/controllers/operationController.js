const Booking = require('../models/Booking');
const Room = require('../models/Room');
const CheckInOut = require('../models/CheckInOut');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');

// @desc    Perform Guest Check-In
// @route   POST /api/operations/check-in
// @access  Private (Staff / Admin)
const checkInGuest = async (req, res, next) => {
  try {
    const { bookingId, keyCardNumber, idProofType, idProofNumber, depositPaid, notes } = req.body;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot check-in a cancelled reservation' });
    }

    if (booking.bookingStatus === 'checked-in') {
      return res.status(400).json({ success: false, message: 'Guest is already checked in' });
    }

    // Create CheckInOut record
    const checkInRecord = await CheckInOut.create({
      booking: booking._id,
      guest: booking.guest,
      room: booking.room._id,
      checkedInBy: req.user._id,
      checkInTime: new Date(),
      keyCardNumber: keyCardNumber || `KC-${Math.floor(100 + Math.random() * 900)}`,
      idProofType: idProofType || 'Passport',
      idProofNumber: idProofNumber || 'ID-VERIFIED',
      depositPaid: depositPaid || 0,
      notes: notes || '',
      status: 'checked-in',
    });

    // Update booking and room
    booking.bookingStatus = 'checked-in';
    await booking.save();

    await Room.findByIdAndUpdate(booking.room._id, { status: 'booked' });

    // Notify guest
    await Notification.create({
      recipient: booking.guest,
      title: 'Welcome to HotelPro!',
      message: `You have successfully checked into Room #${booking.room.roomNumber}. Keycard issued: ${checkInRecord.keyCardNumber}. Enjoy your stay!`,
      type: 'checkin',
      link: '/guest/bookings',
    });

    // Log operation
    await AdminLog.create({
      user: req.user._id,
      action: 'GUEST_CHECK_IN',
      module: 'OPERATIONS',
      details: `Checked in guest for Room #${booking.room.roomNumber}`,
    });

    res.status(200).json({
      success: true,
      message: 'Guest checked in successfully',
      checkInRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Perform Guest Check-Out
// @route   POST /api/operations/check-out
// @access  Private (Staff / Admin)
const checkOutGuest = async (req, res, next) => {
  try {
    const { bookingId, roomConditionOnCheckOut, depositRefunded, notes } = req.body;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'checked-in') {
      return res.status(400).json({ success: false, message: 'Guest is not currently checked in' });
    }

    const checkInRecord = await CheckInOut.findOne({ booking: booking._id });
    if (checkInRecord) {
      checkInRecord.checkOutTime = new Date();
      checkInRecord.checkedOutBy = req.user._id;
      checkInRecord.status = 'checked-out';
      checkInRecord.roomConditionOnCheckOut = roomConditionOnCheckOut || 'Good';
      checkInRecord.depositRefunded = depositRefunded !== undefined ? depositRefunded : true;
      if (notes) checkInRecord.notes += ` | Checkout note: ${notes}`;
      await checkInRecord.save();
    }

    booking.bookingStatus = 'checked-out';
    await booking.save();

    // Mark room as 'cleaning' so housekeeping workflow triggers automatically
    await Room.findByIdAndUpdate(booking.room._id, { status: 'cleaning' });

    // Notify guest
    await Notification.create({
      recipient: booking.guest,
      title: 'Thank You for Staying With Us!',
      message: `You have checked out of Room #${booking.room.roomNumber}. We hope you had a pleasant stay. Please take a moment to leave a review!`,
      type: 'checkout',
      link: `/guest/bookings`,
    });

    await AdminLog.create({
      user: req.user._id,
      action: 'GUEST_CHECK_OUT',
      module: 'OPERATIONS',
      details: `Checked out guest from Room #${booking.room.roomNumber}. Room queued for cleaning.`,
    });

    res.status(200).json({
      success: true,
      message: 'Guest checked out successfully. Room marked for cleaning.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Room Status (Housekeeping & Maintenance)
// @route   PUT /api/operations/room/:roomId/status
// @access  Private (Staff / Admin)
const updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'available', 'cleaning', 'maintenance', 'booked'
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.status = status;
    await room.save();

    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_ROOM_STATUS',
      module: 'OPERATIONS',
      details: `Room #${room.roomNumber} status changed to '${status}' by staff`,
    });

    res.json({
      success: true,
      message: `Room status updated to ${status}`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Operations Overview (Daily arrivals, departures, occupancy)
// @route   GET /api/operations/overview
// @access  Private (Staff / Admin)
const getOperationsOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      activeCheckIns,
      todayArrivals,
      todayDepartures,
      roomsCleaning,
      roomsMaintenance,
      totalRooms,
    ] = await Promise.all([
      Booking.countDocuments({ bookingStatus: 'checked-in' }),
      Booking.countDocuments({
        bookingStatus: 'confirmed',
        checkInDate: { $gte: today, $lt: tomorrow },
      }),
      Booking.countDocuments({
        bookingStatus: 'checked-in',
        checkOutDate: { $gte: today, $lt: tomorrow },
      }),
      Room.countDocuments({ status: 'cleaning' }),
      Room.countDocuments({ status: 'maintenance' }),
      Room.countDocuments(),
    ]);

    res.json({
      success: true,
      overview: {
        activeCheckIns,
        todayArrivals,
        todayDepartures,
        roomsCleaning,
        roomsMaintenance,
        totalRooms,
        occupancyRate: totalRooms > 0 ? Math.round((activeCheckIns / totalRooms) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkInGuest,
  checkOutGuest,
  updateRoomStatus,
  getOperationsOverview,
};
