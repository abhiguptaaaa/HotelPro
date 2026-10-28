const mongoose = require('mongoose');

const roomCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      unique: true,
      trim: true,
      enum: ['Standard', 'Deluxe', 'Executive Suite', 'Presidential Suite', 'Family Suite'],
    },
    description: {
      type: String,
      required: [true, 'Please provide category description'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price per night'],
      min: 0,
    },
    maxGuests: {
      type: Number,
      required: true,
      default: 2,
    },
    bedType: {
      type: String,
      required: true,
      enum: ['Single Bed', 'Queen Bed', 'King Bed', 'Twin Beds', 'King + Sofa Bed'],
    },
    roomSizeSqFt: {
      type: Number,
      default: 350,
    },
    features: {
      type: [String],
      default: ['Air Conditioning', 'LED Smart TV', 'Mini Bar', 'Coffee Maker', 'Work Desk'],
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoomCategory', roomCategorySchema);
