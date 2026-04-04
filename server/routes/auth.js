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
// @desc  Register a new restaurant + admin account
router.post('/register', async (req, res) => {
  try {
    const { restaurantName, slug, email, password } = req.body;

    // Validate required fields
    if (!restaurantName || !slug || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'Restaurant slug already exists' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create restaurant
    const restaurant = await Restaurant.create({ name: restaurantName, slug });

    // Create admin linked to restaurant
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      email,
      password: hashedPassword,
      restaurantId: restaurant._id
    });

    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      slug: restaurant.slug,
      token: generateToken(admin._id, restaurant._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
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
      token: generateToken(admin._id, admin.restaurantId._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
