const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const AdminLog = require('../models/AdminLog');

// @desc    Create a new room booking
// @route   POST /api/bookings
// @access  Private (Guest/User)
const createBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestsCount,
      specialRequests,
      paymentMethod,
    } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ success: false, message: 'Please provide room, check-in, and check-out dates' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ success: false, message: 'Check-out date must be strictly after check-in date' });
    }

    const room = await Room.findById(roomId).populate('hotel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check date collisions
    const collision = await Booking.findOne({
      room: roomId,
      bookingStatus: { $in: ['confirmed', 'checked-in'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (collision) {
      return res.status(400).json({
        success: false,
        message: 'This room is already reserved for the selected date range. Please choose different dates or another room.',
      });
    }

    // Calculate nights & pricing
    const oneDay = 1000 * 60 * 60 * 24;
    const totalNights = Math.max(1, Math.round((checkOut - checkIn) / oneDay));
    const effectivePrice = room.discountPercent > 0
      ? Math.round(room.pricePerNight * (1 - room.discountPercent / 100))
      : room.pricePerNight;

    const roomCharges = effectivePrice * totalNights;
    const taxAmount = Math.round(roomCharges * 0.12); // 12% standard GST
    const totalAmount = roomCharges + taxAmount;

    // Generate unique booking number
    const bookingNumber = `HP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const booking = await Booking.create({
      bookingNumber,
      guest: req.user._id,
      room: room._id,
      hotel: room.hotel?._id || (await Hotel.findOne())?._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      guestsCount: guestsCount || { adults: 1, children: 0 },
      pricePerNight: effectivePrice,
      roomCharges,
      taxAmount,
      totalAmount,
      paymentMethod: paymentMethod || 'credit_card',
      paymentStatus: 'paid', // Auto-completed for booking flow demonstration
      bookingStatus: 'confirmed',
      specialRequests: specialRequests || '',
    });

    // Create payment transaction record
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'credit_card',
      transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentGateway: 'mock_gateway',
      status: 'completed',
      invoiceNumber,
    });

    // Create user notification
    await Notification.create({
      recipient: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your reservation for Room #${room.roomNumber} (${booking.bookingNumber}) is confirmed. Total: ₹${totalAmount.toLocaleString('en-IN')}`,
      type: 'booking',
      link: `/guest/bookings`,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created and confirmed successfully!',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private (Guest)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate({
        path: 'room',
        populate: { path: 'category' },
      })
      .populate('hotel')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'room',
        populate: { path: 'category' },
      })
      .populate('hotel')
      .populate('guest', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify ownership or staff/admin role
    if (booking.guest._id.toString() !== req.user._id.toString() && req.user.role === 'guest') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/bookings
// @access  Private (Admin / Staff)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (search) {
      query.bookingNumber = { $regex: search, $options: 'i' };
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'room',
        populate: { path: 'category' },
      })
      .populate('guest', 'name email phone')
      .populate('hotel')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking with refund processing
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Guest / Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check permissions
    if (booking.guest.toString() !== req.user._id.toString() && req.user.role === 'guest') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    if (booking.bookingStatus === 'checked-in' || booking.bookingStatus === 'checked-out') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a booking that is currently active or completed' });
    }

    // Calculate refund based on time until check-in
    const now = new Date();
    const hoursUntilCheckIn = (new Date(booking.checkInDate) - now) / (1000 * 60 * 60);

    let refundAmount = 0;
    if (hoursUntilCheckIn >= 24) {
      refundAmount = booking.totalAmount; // 100% refund policy
    } else if (hoursUntilCheckIn > 0) {
      refundAmount = Math.round(booking.totalAmount * 0.8); // 80% refund policy within 24h
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'Guest requested cancellation';
    booking.refundAmount = refundAmount;
    booking.paymentStatus = refundAmount > 0 ? 'refunded' : booking.paymentStatus;
    booking.cancelledAt = new Date();

    await booking.save();

    // Create notification
    await Notification.create({
      recipient: booking.guest,
      title: 'Booking Cancelled',
      message: `Booking #${booking.bookingNumber} was cancelled. Refund of ₹${refundAmount.toLocaleString('en-IN')} has been processed.`,
      type: 'booking',
      link: `/guest/bookings`,
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Staff / Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin / Staff)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.bookingStatus = bookingStatus || booking.bookingStatus;
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  cancelBooking,
  updateBookingStatus,
};
