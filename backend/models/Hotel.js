const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hotel name'],
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Luxury & Comfort Redefined',
    },
    description: {
      type: String,
      required: [true, 'Please provide hotel description'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      zipCode: { type: String, default: '110001' },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    amenities: {
      type: [String],
      default: [
        'Free High-Speed Wi-Fi',
        'Swimming Pool',
        'Fitness Center & Spa',
        '24/7 Room Service',
        'Multi-Cuisine Restaurant',
        'Free Valet Parking',
        'Airport Shuttle',
        'Concierge Desk',
      ],
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    checkInTime: {
      type: String,
      default: '14:00',
    },
    checkOutTime: {
      type: String,
      default: '11:00',
    },
    policies: {
      cancellation: {
        type: String,
        default: 'Free cancellation up to 24 hours before check-in date.',
      },
      petFriendly: {
        type: Boolean,
        default: true,
      },
      smoking: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hotel', hotelSchema);
