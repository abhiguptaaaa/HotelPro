const mongoose = require('mongoose');
const Room = require('../models/Room');
const RoomCategory = require('../models/RoomCategory');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const AdminLog = require('../models/AdminLog');

// @desc    Get all rooms with search & filter
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, capacity, status, search, sort } = req.query;
    const query = {};

    // 1. Category Filter (Supports both ObjectId and Category Name string like 'Deluxe')
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category) && String(new mongoose.Types.ObjectId(category)) === category) {
        query.category = category;
      } else {
        const catDoc = await RoomCategory.findOne({
          name: { $regex: new RegExp(`^${category}$`, 'i') },
        });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          const partialCat = await RoomCategory.findOne({
            name: { $regex: category, $options: 'i' },
          });
          if (partialCat) {
            query.category = partialCat._id;
          }
        }
      }
    }

    // 2. Status Filter
    if (status) {
      query.status = status;
    }

    // 3. Capacity Filter
    if (capacity && !isNaN(Number(capacity)) && Number(capacity) > 0) {
      query.capacity = { $gte: Number(capacity) };
    }

    // 4. Price Range Filter
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice && !isNaN(Number(minPrice))) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) query.pricePerNight.$lte = Number(maxPrice);
    }

    let matchingHotels = [];
    // 5. Intelligent Multi-Entity Search (Title, Description, Amenities, Category Names & Hotel/City)
    if (search && search.trim()) {
      const term = search.trim();

      // Find any categories or hotels that match this keyword
      const [matchedCategories, matchedHotelDocs] = await Promise.all([
        RoomCategory.find({ name: { $regex: term, $options: 'i' } }).select('_id'),
        Hotel.find({
          $or: [
            { name: { $regex: term, $options: 'i' } },
            { 'address.city': { $regex: term, $options: 'i' } },
            { 'address.state': { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
            { amenities: { $regex: term, $options: 'i' } },
          ],
        }),
      ]);

      matchingHotels = matchedHotelDocs;
      const catIds = matchedCategories.map((c) => c._id);
      const hotelIds = matchedHotelDocs.map((h) => h._id);

      const searchConditions = [
        { title: { $regex: term, $options: 'i' } },
        { roomNumber: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { amenities: { $regex: term, $options: 'i' } },
      ];

      if (catIds.length > 0) {
        searchConditions.push({ category: { $in: catIds } });
      }
      if (hotelIds.length > 0) {
        searchConditions.push({ hotel: { $in: hotelIds } });
      }

      query.$or = searchConditions;
    }

    let roomQuery = Room.find(query).populate('category').populate('hotel');

    if (sort === 'price_asc') {
      roomQuery = roomQuery.sort({ pricePerNight: 1 });
    } else if (sort === 'price_desc') {
      roomQuery = roomQuery.sort({ pricePerNight: -1 });
    } else if (sort === 'rating') {
      roomQuery = roomQuery.sort({ rating: -1 });
    } else {
      roomQuery = roomQuery.sort({ roomNumber: 1 });
    }

    const rooms = await roomQuery;

    res.json({
      success: true,
      count: rooms.length,
      rooms,
      hotels: matchingHotels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room details
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('category')
      .populate('hotel');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc    Check room availability for given dates
// @route   POST /api/rooms/:id/availability
// @access  Public
const checkRoomAvailability = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate } = req.body;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ success: false, message: 'Please provide check-in and check-out dates' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    // Find any overlapping confirmed/checked-in booking for this room
    const conflictingBooking = await Booking.findOne({
      room: req.params.id,
      bookingStatus: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } },
      ],
    });

    const isAvailable = !conflictingBooking;

    res.json({
      success: true,
      isAvailable,
      message: isAvailable ? 'Room is available for the selected dates' : 'Room is already reserved for the selected dates',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin / Staff)
const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);

    await AdminLog.create({
      user: req.user._id,
      action: 'CREATE_ROOM',
      module: 'ROOMS',
      details: `Created room #${room.roomNumber} (${room.title})`,
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin / Staff)
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await AdminLog.create({
      user: req.user._id,
      action: 'UPDATE_ROOM',
      module: 'ROOMS',
      details: `Updated room #${room.roomNumber}`,
    });

    res.json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await room.deleteOne();

    await AdminLog.create({
      user: req.user._id,
      action: 'DELETE_ROOM',
      module: 'ROOMS',
      details: `Deleted room #${room.roomNumber}`,
    });

    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  checkRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
};
