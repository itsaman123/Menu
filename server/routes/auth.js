const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const Admin = require('../models/Admin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { restaurantName, slug, email, password } = req.body;

    const existingRestaurant = await Restaurant.findOne({ slug });
    if (existingRestaurant) {
      return res.status(400).json({ message: 'Restaurant slug already exists' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const restaurant = await Restaurant.create({ name: restaurantName, slug });

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
      slug: restaurant.slug,
      token: generateToken(admin._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).populate('restaurantId');

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin._id,
        email: admin.email,
        restaurantId: admin.restaurantId._id,
        slug: admin.restaurantId.slug,
        token: generateToken(admin._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
