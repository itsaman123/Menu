const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const { protectSuperAdmin } = require('../middleware/authMiddleware');

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

module.exports = router;
