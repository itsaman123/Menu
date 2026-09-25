const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const OtpLog = require('../models/OtpLog');
const ContactSubmission = require('../models/ContactSubmission');
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

// Percentage change vs. previous period. Returns null when there's nothing to compare against.
function growthPct(current, previous) {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// @route   GET /api/superadmin/stats
// @desc    Platform-wide statistics for the super admin dashboard
router.get('/stats', protectSuperAdmin, async (req, res) => {
  try {
    const now              = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalAdmins, activeAdmins, allOrders,
      restaurantsThisMonth, restaurantsLastMonth,
      ordersThisMonth, ordersLastMonth,
      otpSent, otpVerified, deviceCounts,
    ] = await Promise.all([
      Admin.countDocuments(),
      Admin.countDocuments({ isActive: true }),
      Order.find({}, 'totalAmount'),
      Restaurant.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Restaurant.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      OtpLog.countDocuments({ event: 'sent' }),
      OtpLog.countDocuments({ event: 'verified' }),
      OtpLog.aggregate([{ $group: { _id: '$device', count: { $sum: 1 } } }]),
    ]);

    const totalOrders  = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const mobileCount  = deviceCounts.find(d => d._id === 'mobile')?.count  || 0;
    const desktopCount = deviceCounts.find(d => d._id === 'desktop')?.count || 0;
    const deviceTotal  = mobileCount + desktopCount;

    res.json({
      totalAdmins,
      activeAdmins,
      totalOrders,
      totalRevenue,
      restaurantsGrowthPct: growthPct(restaurantsThisMonth, restaurantsLastMonth),
      ordersGrowthPct:      growthPct(ordersThisMonth, ordersLastMonth),
      otpSent,
      otpVerified,
      otpConversionRate: otpSent > 0 ? Math.round((otpVerified / otpSent) * 1000) / 10 : 0,
      deviceUsage: {
        mobilePct:   deviceTotal > 0 ? Math.round((mobileCount / deviceTotal) * 1000) / 10 : 0,
        desktopPct:  deviceTotal > 0 ? Math.round((desktopCount / deviceTotal) * 1000) / 10 : 0,
        mobileCount,
        desktopCount,
      },
    });
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

// @route   PUT /api/superadmin/restaurants/:id
// @desc    Update restaurant name / subscriptionStatus
// @access  SuperAdmin
router.put('/restaurants/:id', protectSuperAdmin, async (req, res) => {
  try {
    const { name, subscriptionStatus } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (subscriptionStatus !== undefined) update.subscriptionStatus = subscriptionStatus;

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/superadmin/admins/:id/reset-password
// @desc    Reset an admin's password
// @access  SuperAdmin
router.post('/admins/:id/reset-password', protectSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    const admin = await Admin.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/restaurant-stats
// @desc    Per-restaurant order count and revenue
// @access  SuperAdmin
router.get('/restaurant-stats', protectSuperAdmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({}, 'name slug subscriptionStatus');
    const stats = await Promise.all(
      restaurants.map(async (r) => {
        const orders = await Order.find({ restaurantId: r._id }, 'totalAmount createdAt status');
        const totalOrders  = orders.length;
        const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const last30       = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentOrders = orders.filter(o => new Date(o.createdAt) >= last30).length;
        return { restaurantId: r._id, name: r.name, slug: r.slug, subscriptionStatus: r.subscriptionStatus, totalOrders, totalRevenue, recentOrders };
      })
    );
    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolves a { start, end } window plus the equal-length preceding window for comparison.
// Accepts either an explicit ?from=&to= date range, or a ?range=daily|weekly|monthly bucket ending now.
function resolvePeriod({ range = 'daily', from, to }) {
  let start, end;
  if (from && to) {
    start = new Date(from);
    start.setHours(0, 0, 0, 0);
    end = new Date(to);
    end.setHours(23, 59, 59, 999);
  } else {
    end = new Date();
    start = new Date(end);
    if (range === 'weekly') start.setDate(start.getDate() - 6);
    else if (range === 'monthly') start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  const spanMs   = end.getTime() - start.getTime();
  const prevEnd   = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - spanMs);
  return { start, end, prevStart, prevEnd };
}

// @route   GET /api/superadmin/orders/summary
// @desc    Platform-wide order volume, avg order value and cancellation rate for a period,
//          with % change vs. the equal-length preceding period
// @access  SuperAdmin
router.get('/orders/summary', protectSuperAdmin, async (req, res) => {
  try {
    const { start, end, prevStart, prevEnd } = resolvePeriod(req.query);

    const [current, previous] = await Promise.all([
      Order.find({ createdAt: { $gte: start, $lte: end } }, 'totalAmount status'),
      Order.find({ createdAt: { $gte: prevStart, $lte: prevEnd } }, 'totalAmount status'),
    ]);

    const summarize = (orders) => {
      const billable = orders.filter(o => o.status !== 'cancelled');
      const totalVolume = billable.reduce((s, o) => s + (o.totalAmount || 0), 0);
      const cancelledCount = orders.length - billable.length;
      return {
        totalVolume,
        avgOrderValue: billable.length > 0 ? totalVolume / billable.length : 0,
        cancellationRate: orders.length > 0 ? (cancelledCount / orders.length) * 100 : 0,
      };
    };

    const cur  = summarize(current);
    const prev = summarize(previous);

    res.json({
      totalVolume:       Math.round(cur.totalVolume * 100) / 100,
      avgOrderValue:      Math.round(cur.avgOrderValue * 100) / 100,
      cancellationRate:   Math.round(cur.cancellationRate * 10) / 10,
      totalVolumeChangePct:     growthPct(cur.totalVolume, prev.totalVolume),
      avgOrderValueChangePct:   growthPct(cur.avgOrderValue, prev.avgOrderValue),
      cancellationRateChangePct: growthPct(cur.cancellationRate, prev.cancellationRate),
      period: { start, end },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/orders/trends
// @desc    Daily order counts for a period vs. the equal-length preceding period (for charting)
// @access  SuperAdmin
router.get('/orders/trends', protectSuperAdmin, async (req, res) => {
  try {
    const { start, end, prevStart, prevEnd } = resolvePeriod(req.query);
    const DAY_MS = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.round((end - start) / DAY_MS) + 1);

    const bucketByDay = async (rangeStart, rangeEnd) => {
      const orders = await Order.find({ createdAt: { $gte: rangeStart, $lte: rangeEnd } }, 'createdAt');
      const counts = new Array(days).fill(0);
      orders.forEach(o => {
        const idx = Math.floor((new Date(o.createdAt) - rangeStart) / DAY_MS);
        if (idx >= 0 && idx < days) counts[idx]++;
      });
      return counts;
    };

    const [current, previous] = await Promise.all([
      bucketByDay(start, end),
      bucketByDay(prevStart, prevEnd),
    ]);

    const labels = Array.from({ length: days }, (_, i) =>
      new Date(start.getTime() + i * DAY_MS).toLocaleDateString('en-US', { weekday: 'short' })
    );

    res.json({ labels, current, previous });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/orders/top-performers
// @desc    Top restaurants by revenue for a period
// @access  SuperAdmin
router.get('/orders/top-performers', protectSuperAdmin, async (req, res) => {
  try {
    const { start, end } = resolvePeriod(req.query);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 20);

    const results = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$restaurantId', revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
      { $unwind: '$restaurant' },
      { $project: { _id: 0, restaurantId: '$_id', name: '$restaurant.name', slug: '$restaurant.slug', revenue: 1, orders: 1 } },
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/orders
// @desc    Paginated, searchable, filterable order history across all restaurants
// @query   page, limit, search (order id / restaurant name / customer phone), status, from, to, restaurantId
// @access  SuperAdmin
router.get('/orders', protectSuperAdmin, async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const { search = '', status, from, to, restaurantId } = req.query;

    const match = {};
    if (status && ['pending', 'confirmed', 'preparing', 'completed', 'cancelled'].includes(status)) {
      match.status = status;
    }
    if (restaurantId && mongoose.isValidObjectId(restaurantId)) {
      match.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }
    if (from || to) {
      match.createdAt = {};
      if (from) { const d = new Date(from); d.setHours(0, 0, 0, 0); match.createdAt.$gte = d; }
      if (to)   { const d = new Date(to);   d.setHours(23, 59, 59, 999); match.createdAt.$lte = d; }
    }

    const pipeline = [
      { $match: match },
      { $lookup: { from: 'restaurants', localField: 'restaurantId', foreignField: '_id', as: 'restaurant' } },
      { $unwind: '$restaurant' },
    ];

    const term = search.trim();
    if (term) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      pipeline.push({
        $match: {
          $or: [
            { customerPhone: regex },
            { 'restaurant.name': regex },
            { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: term, options: 'i' } } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: {
                orderId: { $concat: ['SCH-', { $toUpper: { $substrCP: [{ $toString: '$_id' }, 18, 6] } }] },
                createdAt: 1,
                restaurant: { name: '$restaurant.name', slug: '$restaurant.slug' },
                customerPhone: 1,
                items: 1,
                totalAmount: 1,
                status: 1,
              } },
          ],
          totalCount: [{ $count: 'count' }],
        },
      }
    );

    const [result] = await Order.aggregate(pipeline);
    const total = result.totalCount[0]?.count || 0;

    res.json({ orders: result.data, total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/superadmin/inquiries
// @desc    List marketing-site contact form submissions
router.get('/inquiries', protectSuperAdmin, async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort('-createdAt').limit(200);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
