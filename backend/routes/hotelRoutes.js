const express = require('express');
const router = express.Router();
const {
  getHotelInfo,
  getAllHotels,
  getSearchSuggestions,
  updateHotelInfo,
  getCategories,
  createCategory,
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getHotelInfo);
router.get('/all', getAllHotels);
router.get('/suggestions', getSearchSuggestions);
router.put('/', protect, authorize('admin'), updateHotelInfo);

router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);

module.exports = router;
