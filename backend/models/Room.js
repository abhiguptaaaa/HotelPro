const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide room title'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    capacity: {
      type: Number,
      required: true,
      default: 2,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'cleaning', 'maintenance'],
      default: 'available',
    },
    floor: {
      type: Number,
      default: 1,
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    amenities: {
      type: [String],
      default: [
        'High-Speed Wi-Fi',
        'Air Conditioning',
        'Flat Screen Smart TV',
        'En-suite Luxury Bathroom',
        'Complimentary Breakfast',
        'Mini Refrigerator',
        'Safe Box',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isSmokingAllowed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
