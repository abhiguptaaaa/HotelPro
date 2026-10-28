const mongoose = require('mongoose');

const checkInOutSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    keyCardNumber: {
      type: String,
      default: '',
    },
    idProofType: {
      type: String,
      enum: ['Passport', 'Aadhaar Card', 'Driving License', 'Voter ID', 'National ID'],
      default: 'Passport',
    },
    idProofNumber: {
      type: String,
      default: '',
    },
    depositPaid: {
      type: Number,
      default: 0,
    },
    depositRefunded: {
      type: Boolean,
      default: false,
    },
    roomConditionOnCheckOut: {
      type: String,
      enum: ['Excellent', 'Good', 'Damaged', 'Requires Deep Cleaning', 'Pending Inspection'],
      default: 'Pending Inspection',
    },
    status: {
      type: String,
      enum: ['checked-in', 'checked-out'],
      default: 'checked-in',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CheckInOut', checkInOutSchema);
