const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image provided' });
  }
  
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path
  });
});

module.exports = router;
