const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Please provide a review headline'],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Please write your review comment'],
    },
    staffResponse: {
      comment: { type: String, default: '' },
      respondedAt: { type: Date },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
