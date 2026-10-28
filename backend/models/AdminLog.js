const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      enum: ['AUTH', 'ROOMS', 'BOOKINGS', 'PAYMENTS', 'OPERATIONS', 'SERVICES', 'USERS', 'SYSTEM'],
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AdminLog', adminLogSchema);
