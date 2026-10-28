const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Create a new guest service request
// @route   POST /api/services
// @access  Private (Guest)
const createServiceRequest = async (req, res, next) => {
  try {
    const { bookingId, type, description, priority } = req.body;

    const booking = await Booking.findById(bookingId).populate('room');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.guest.toString() !== req.user._id.toString() && req.user.role === 'guest') {
      return res.status(403).json({ success: false, message: 'Unauthorized for this booking' });
    }

    const service = await ServiceRequest.create({
      booking: booking._id,
      guest: req.user._id,
      room: booking.room._id,
      type,
      description,
      priority: priority || 'medium',
    });

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully. Hotel staff will attend to it shortly.',
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's service requests
// @route   GET /api/services/my
// @access  Private (Guest)
const getMyServiceRequests = async (req, res, next) => {
  try {
    const services = await ServiceRequest.find({ guest: req.user._id })
      .populate('room', 'roomNumber title')
      .populate('booking', 'bookingNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all service requests (Staff / Admin)
// @route   GET /api/services
// @access  Private (Staff / Admin)
const getAllServiceRequests = async (req, res, next) => {
  try {
    const { status, type, priority } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const services = await ServiceRequest.find(query)
      .populate('guest', 'name email phone')
      .populate('room', 'roomNumber title')
      .populate('booking', 'bookingNumber')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request status or assignment
// @route   PUT /api/services/:id
// @access  Private (Staff / Admin)
const updateServiceRequest = async (req, res, next) => {
  try {
    const { status, assignedTo, cost, staffNotes } = req.body;
    const service = await ServiceRequest.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (status) service.status = status;
    if (assignedTo) service.assignedTo = assignedTo;
    if (cost !== undefined) service.cost = cost;
    if (staffNotes) service.staffNotes = staffNotes;

    if (status === 'completed') {
      service.resolvedAt = new Date();

      // Notify guest
      await Notification.create({
        recipient: service.guest,
        title: 'Service Request Completed',
        message: `Your request for ${service.type} has been fulfilled by staff.`,
        type: 'service',
        link: '/guest/services',
      });
    }

    await service.save();

    res.json({ success: true, message: 'Service request updated', service });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  updateServiceRequest,
};
