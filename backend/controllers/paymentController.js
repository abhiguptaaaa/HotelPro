const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

// @desc    Process a simulated or gateway payment
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'credit_card',
      transactionId,
      paymentGateway: 'mock_gateway',
      status: 'completed',
      invoiceNumber,
      paidAt: new Date(),
    });

    booking.paymentStatus = 'paid';
    booking.transactionId = transactionId;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private
const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('booking')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin / Staff)
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'booking',
        populate: { path: 'room' },
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = payments
      .filter((p) => p.status === 'completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      success: true,
      count: payments.length,
      totalRevenue,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed invoice for a booking
// @route   GET /api/payments/invoice/:bookingId
// @access  Private
const getInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate({
        path: 'room',
        populate: { path: 'category' },
      })
      .populate('guest', 'name email phone address')
      .populate('hotel');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const payment = await Payment.findOne({ booking: booking._id });
    const hotel = booking.hotel || (await Hotel.findOne());

    const invoiceData = {
      invoiceNumber: payment ? payment.invoiceNumber : `INV-${booking.bookingNumber}`,
      date: payment ? payment.paidAt : booking.createdAt,
      hotel: {
        name: hotel.name,
        address: hotel.address,
        phone: hotel.phone,
        email: hotel.email,
      },
      customer: {
        name: booking.guest.name,
        email: booking.guest.email,
        phone: booking.guest.phone,
      },
      booking: {
        bookingNumber: booking.bookingNumber,
        roomNumber: booking.room.roomNumber,
        roomTitle: booking.room.title,
        category: booking.room.category?.name || 'Standard',
        checkIn: booking.checkInDate,
        checkOut: booking.checkOutDate,
        totalNights: booking.totalNights,
        pricePerNight: booking.pricePerNight,
      },
      charges: {
        roomCharges: booking.roomCharges,
        taxAmount: booking.taxAmount,
        totalAmount: booking.totalAmount,
      },
      payment: {
        status: booking.paymentStatus,
        method: booking.paymentMethod,
        transactionId: payment ? payment.transactionId : booking.transactionId || 'N/A',
      },
    };

    res.json({ success: true, invoice: invoiceData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentByBooking,
  getAllPayments,
  getInvoice,
};
