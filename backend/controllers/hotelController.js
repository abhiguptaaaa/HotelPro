const Hotel = require('../models/Hotel');
const RoomCategory = require('../models/RoomCategory');

// @desc    Get Hotel Information
// @route   GET /api/hotel
// @access  Public
const getHotelInfo = async (req, res, next) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = await Hotel.create({
        name: 'HotelPro Grand Palace',
        tagline: 'World-Class Hospitality & Modern Comfort',
        description: 'Experience premier hospitality with refined guest suites, 24/7 personalized concierge, exquisite dining, and world-class spa facilities.',
        address: {
          street: '100 Marina Boulevard, Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          zipCode: '110001',
        },
        phone: '+91 98765 43210',
        email: 'reservations@hotelpro.com',
      });
    }
    res.json({ success: true, hotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Hotel Information
// @route   PUT /api/hotel
// @access  Private (Admin only)
const updateHotelInfo = async (req, res, next) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = new Hotel(req.body);
    } else {
      Object.assign(hotel, req.body);
    }
    const updatedHotel = await hotel.save();
    res.json({ success: true, hotel: updatedHotel });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all room categories
// @route   GET /api/hotel/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find().sort({ basePrice: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create room category
// @route   POST /api/hotel/categories
// @access  Private (Admin only)
const createCategory = async (req, res, next) => {
  try {
    const category = await RoomCategory.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels
// @route   GET /api/hotel/all
// @access  Public
const getAllHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ isActive: true }).sort({ rating: -1 });
    res.json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    next(error);
  }
};

// @desc    Get search suggestions / autocomplete for places, hotels, amenities
// @route   GET /api/hotel/suggestions
// @access  Public
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    const term = (q || '').trim();

    const [hotels, categories] = await Promise.all([
      Hotel.find({ isActive: true }).select('name address.city address.state rating'),
      RoomCategory.find().select('name coverImage basePrice'),
    ]);

    const uniqueCities = [...new Set(hotels.map((h) => h.address.city))];
    const popularAmenities = [
      'Infinity Sky Pool',
      'Wellness Spa & Jacuzzi',
      'Michelin Star Dining',
      'Free High-Speed Wi-Fi',
      'Private Beach Access',
      'Airport Shuttle',
      'Executive Business Lounge',
    ];

    let suggestions = [];

    if (!term) {
      // Default trending suggestions when search box is clicked
      suggestions = [
        ...uniqueCities.map((city) => ({
          type: 'city',
          title: city,
          subtitle: 'Popular Destination',
          query: city,
        })),
        ...hotels.slice(0, 3).map((h) => ({
          type: 'hotel',
          title: h.name,
          subtitle: `${h.address.city} • ★ ${h.rating}`,
          query: h.name,
        })),
        {
          type: 'amenity',
          title: 'Infinity Sky Pool',
          subtitle: 'Featured 5-Star Amenity',
          query: 'Pool',
        },
      ];
    } else {
      const regex = new RegExp(term, 'i');

      // 1. Match Cities / Destinations
      uniqueCities
        .filter((city) => regex.test(city))
        .forEach((city) => {
          suggestions.push({
            type: 'city',
            title: city,
            subtitle: 'Destination / City',
            query: city,
          });
        });

      // 2. Match Hotels
      hotels
        .filter(
          (h) =>
            regex.test(h.name) ||
            regex.test(h.address.city) ||
            regex.test(h.address.state)
        )
        .forEach((h) => {
          suggestions.push({
            type: 'hotel',
            title: h.name,
            subtitle: `${h.address.city}, ${h.address.state} • ★ ${h.rating}`,
            query: h.name,
          });
        });

      // 3. Match Categories
      categories
        .filter((c) => regex.test(c.name))
        .forEach((c) => {
          suggestions.push({
            type: 'category',
            title: `${c.name} Rooms`,
            subtitle: `From ₹${c.basePrice?.toLocaleString('en-IN')}/night`,
            query: c.name,
          });
        });

      // 4. Match Amenities / Facilities
      popularAmenities
        .filter((a) => regex.test(a))
        .forEach((a) => {
          suggestions.push({
            type: 'amenity',
            title: a,
            subtitle: 'Resort Facility & Experience',
            query: a.replace(' & Jacuzzi', '').replace('Infinity Sky ', '').replace('Michelin Star ', ''),
          });
        });
    }

    res.json({ success: true, count: suggestions.length, suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotelInfo,
  getAllHotels,
  getSearchSuggestions,
  updateHotelInfo,
  getCategories,
  createCategory,
};
