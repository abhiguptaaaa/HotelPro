const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  checkRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/:id/availability', checkRoomAvailability);

// Image upload route
router.post('/upload', protect, authorize('admin', 'staff'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

router.post('/', protect, authorize('admin', 'staff'), createRoom);
router.put('/:id', protect, authorize('admin', 'staff'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
