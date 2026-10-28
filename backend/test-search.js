const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });
if (!process.env.MONGO_URI) dotenv.config({ path: '.env' });

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  const Room = require('./models/Room');
  const Hotel = require('./models/Hotel');
  const RoomCategory = require('./models/RoomCategory');

  // Exact request query from user's URL: /rooms?search=Jaipur&capacity=2
  const reqQuery = {
    search: 'Jaipur',
    capacity: '2',
    maxPrice: '25000',
  };

  const { category, minPrice, maxPrice, capacity, status, search, sort } = reqQuery;
  const query = {};

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category) && String(new mongoose.Types.ObjectId(category)) === category) {
      query.category = category;
    } else {
      const catDoc = await RoomCategory.findOne({
        name: { $regex: new RegExp(`^${category}$`, 'i') },
      });
      if (catDoc) query.category = catDoc._id;
    }
  }

  if (status) query.status = status;
  if (capacity && !isNaN(Number(capacity)) && Number(capacity) > 0) {
    query.capacity = { $gte: Number(capacity) };
  }

  if (minPrice || maxPrice) {
    query.pricePerNight = {};
    if (minPrice && !isNaN(Number(minPrice))) query.pricePerNight.$gte = Number(minPrice);
    if (maxPrice && !isNaN(Number(maxPrice))) query.pricePerNight.$lte = Number(maxPrice);
  }

  let matchingHotels = [];
  if (search && search.trim()) {
    const term = search.trim();
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

  console.log('CONSTRUCTED MONGOOSE QUERY:', JSON.stringify(query, null, 2));

  const rooms = await Room.find(query).populate('category').populate('hotel');
  console.log('ROOMS RETURNED:', rooms.length);
  rooms.forEach((r) => console.log(' -> Found:', r.roomNumber, r.title, 'Price:', r.pricePerNight, 'Hotel:', r.hotel?.name));

  process.exit(0);
}

test().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});
