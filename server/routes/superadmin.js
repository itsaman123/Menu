const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const OtpLog = require('../models/OtpLog');
const { protectSuperAdmin } = require('../middleware/authMiddleware');
const { sendOnboardingEmail } = require('../utils/mailer');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

// @route   POST /api/superadmin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const sa = await SuperAdmin.findOne({ email });
    if (!sa) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, sa.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    res.json({ _id: sa._id, email: sa.email, token: generateToken(sa._id), role: 'superadmin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/stats
// @desc    Platform-wide statistics for the super admin dashboard
router.get('/stats', protectSuperAdmin, async (req, res) => {
  try {
    const [totalAdmins, activeAdmins, allOrders] = await Promise.all([
      Admin.countDocuments(),
      Admin.countDocuments({ isActive: true }),
      Order.find({}, 'totalAmount createdAt'),
    ]);

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({ totalAdmins, activeAdmins, totalOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/admins
router.get('/admins', protectSuperAdmin, async (req, res) => {
  try {
    // Populate the restaurant details
    const admins = await Admin.find().populate('restaurantId').select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/superadmin/admins/:id
// @desc    Update admin's active status and feature permissions
router.put('/admins/:id', protectSuperAdmin, async (req, res) => {
  try {
    const { isActive, disabledFeatures } = req.body;
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (disabledFeatures !== undefined) updateData.disabledFeatures = disabledFeatures;

    const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('restaurantId').select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/superadmin/admins/:id
router.delete('/admins/:id', protectSuperAdmin, async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/superadmin/restaurants
// @desc    Onboard a new restaurant + admin account (super admin only)
router.post('/restaurants', protectSuperAdmin, async (req, res) => {
  const { restaurantName, slug, email, password, subscriptionStatus } = req.body;

  if (!restaurantName || !slug || !email || !password) {
    return res.status(400).json({ message: 'Restaurant name, slug, admin email and password are required' });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ message: 'Slug may only contain lowercase letters, numbers and hyphens' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const [existingRestaurant, existingAdmin] = await Promise.all([
      Restaurant.findOne({ slug }),
      Admin.findOne({ email: email.toLowerCase() }),
    ]);
    if (existingRestaurant) return res.status(400).json({ message: 'Slug is already in use' });
    if (existingAdmin)     return res.status(400).json({ message: 'Admin email is already registered' });

    const restaurant = await Restaurant.create({
      name: restaurantName.trim(),
      slug: slug.trim(),
      subscriptionStatus: subscriptionStatus || 'trial',
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      restaurantId: restaurant._id,
    });

    res.status(201).json({
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        subscriptionStatus: restaurant.subscriptionStatus,
        createdAt: restaurant.createdAt,
      },
      admin: {
        _id: admin._id,
        email: admin.email,
        restaurantId: restaurant._id,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/superadmin/send-credentials
// @desc    Email onboarding credentials to a restaurant admin
router.post('/send-credentials', protectSuperAdmin, async (req, res) => {
  const { to, restaurantName, slug, restaurantId, email, password, subscription, appBaseUrl } = req.body;

  if (!to || !restaurantName || !slug || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const base = (appBaseUrl || 'http://localhost:5173').replace(/\/$/, '');
  const loginUrl = `${base}/login`;
  const menuUrl  = `${base}/menu/${slug}`;

  try {
    await sendOnboardingEmail({ to, restaurantName, slug, restaurantId, email, password, subscription, loginUrl, menuUrl });
    res.json({ message: 'Credentials email sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
});

// @route   GET /api/superadmin/otp-stats
// @desc    OTP sent/verified counts per restaurant (platform-wide)
// @access  SuperAdmin
router.get('/otp-stats', protectSuperAdmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({}, 'name slug');
    const stats = await Promise.all(
      restaurants.map(async (r) => {
        const [sent, verified] = await Promise.all([
          OtpLog.countDocuments({ restaurantId: r._id, event: 'sent' }),
          OtpLog.countDocuments({ restaurantId: r._id, event: 'verified' }),
        ]);
        return { restaurantId: r._id, name: r.name, slug: r.slug, sent, verified };
      })
    );
    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
