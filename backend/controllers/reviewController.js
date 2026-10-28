const Review = require('../models/Review');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Create a room review
// @route   POST /api/reviews
// @access  Private (Guest)
const createReview = async (req, res, next) => {
  try {
    const { roomId, bookingId, rating, title, comment } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const review = await Review.create({
      room: room._id,
      hotel: room.hotel,
      guest: req.user._id,
      booking: bookingId,
      rating: Number(rating),
      title,
      comment,
    });

    // Recalculate room average rating
    const roomReviews = await Review.find({ room: room._id });
    const avgRating =
      roomReviews.reduce((acc, item) => item.rating + acc, 0) / roomReviews.length;

    room.rating = Number(avgRating.toFixed(1));
    room.numReviews = roomReviews.length;
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific room
// @route   GET /api/reviews/room/:roomId
// @access  Public
const getRoomReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ room: req.params.roomId, isApproved: true })
      .populate('guest', 'name avatar')
      .populate('staffResponse.respondedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin / Staff)
// @route   GET /api/reviews
// @access  Private (Staff / Admin)
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('guest', 'name email avatar')
      .populate('room', 'roomNumber title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Staff response to a review
// @route   POST /api/reviews/:id/respond
// @access  Private (Staff / Admin)
const respondToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.staffResponse = {
      comment,
      respondedAt: new Date(),
      respondedBy: req.user._id,
    };

    await review.save();

    res.json({ success: true, message: 'Staff response posted successfully', review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getRoomReviews,
  getAllReviews,
  respondToReview,
};
