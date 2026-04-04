const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary (scoped by admin auth + restaurant validation)
// @access  Private (Admin only)
// NOTE:    The `protect` middleware ensures only authenticated admins can upload.
//          The X-Restaurant-Id header is validated against the admin's actual restaurantId.
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image provided' });
  }
  
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: req.file.path,
    restaurantId: req.admin.restaurantId // Return for frontend confirmation
  });
});

module.exports = router;
