const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const Admin = require('../models/Admin');

// Generate JWT with both admin ID and restaurantId embedded
const generateToken = (id, restaurantId) => {
  return jwt.sign({ id, restaurantId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /auth/register
// @desc  Disabled — restaurant onboarding is managed by the Super Admin
router.post('/register', (_req, res) => {
  res.status(403).json({ message: 'Self-registration is disabled. Restaurants are onboarded by the Super Admin.' });
});

// @route POST /auth/login
// @desc  Login admin and return token + restaurant context
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).populate('restaurantId');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ message: 'Account disabled. Please contact Super Admin.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      restaurantId: admin.restaurantId._id,
      restaurantName: admin.restaurantId.name,
      slug: admin.restaurantId.slug,
      disabledFeatures: admin.disabledFeatures || [],
      token: generateToken(admin._id, admin.restaurantId._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route GET /auth/me
// @desc  Get current admin profile to sync disabledFeatures
const { protect } = require('../middleware/authMiddleware');
router.get('/me', protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).populate('restaurantId');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (admin.isActive === false) return res.status(403).json({ message: 'Account disabled' });
    
    res.json({
      _id: admin._id,
      email: admin.email,
      restaurantId: admin.restaurantId._id,
      restaurantName: admin.restaurantId.name,
      slug: admin.restaurantId.slug,
      disabledFeatures: admin.disabledFeatures || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /auth/restaurant-settings
// @desc    Get restaurant's configurable settings (GA tracking ID)
// @access  Protected
router.get('/restaurant-settings', protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.admin.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ gaTrackingId: restaurant.gaTrackingId || '' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GA Measurement ID pattern: G-XXXXXXXX, UA-XXXXX-X, AW-XXXXXXXXX
const GA_ID_RE = /^(G-|UA-|AW-)[A-Z0-9-]+$/i;

// @route   PUT /auth/restaurant-settings
// @desc    Update restaurant's configurable settings
// @access  Protected
router.put('/restaurant-settings', protect, async (req, res) => {
  try {
    const { gaTrackingId } = req.body;
    if (gaTrackingId && !GA_ID_RE.test(gaTrackingId)) {
      return res.status(400).json({ message: 'Invalid Google Analytics ID. Expected format: G-XXXXXXXX' });
    }
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.admin.restaurantId,
      { gaTrackingId: gaTrackingId || '' },
      { new: true }
    );
    res.json({ gaTrackingId: restaurant.gaTrackingId });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /auth/change-password
// @desc    Change logged-in admin's own password
// @access  Protected
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Current password and a new password (min 6 chars) are required' });
  }
  try {
    const admin = await Admin.findById(req.admin._id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();
    res.json({ message: 'Password changed successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
