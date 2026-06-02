const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const OtpLog = require('../models/OtpLog');
const Restaurant = require('../models/Restaurant');
const admin = require('../firebaseAdmin');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const logSendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests, please try again after 5 minutes.' },
});

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: 'Too many verification attempts, please try again later.' },
});

// @route   POST /api/otp/log-send
// @desc    Log that Firebase sent an OTP (analytics tracking only)
// @access  Public
router.post('/log-send', logSendLimiter, async (req, res) => {
  const { phone, slug } = req.body;
  if (!phone || !slug) return res.status(400).json({ message: 'Phone and slug required' });

  try {
    const restaurant = await Restaurant.findOne({ slug });
    if (restaurant) {
      await OtpLog.create({ restaurantId: restaurant._id, phone, event: 'sent' });
    }
    res.json({ message: 'Logged' });
  } catch {
    res.json({ message: 'Logged' }); // never block checkout
  }
});

// @route   POST /api/otp/verify-firebase
// @desc    Verify Firebase ID token, log verified event, issue orderToken
// @access  Public
router.post('/verify-firebase', verifyLimiter, async (req, res) => {
  const { idToken, phone, slug } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Firebase ID token required' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    const tokenPhone = decoded.phone_number;
    const providedPhone = phone?.replace(/\s/g, '');
    if (tokenPhone && providedPhone && tokenPhone !== providedPhone) {
      return res.status(401).json({ message: 'Phone number mismatch' });
    }

    if (slug) {
      const restaurant = await Restaurant.findOne({ slug });
      if (restaurant) {
        await OtpLog.create({
          restaurantId: restaurant._id,
          phone: tokenPhone || providedPhone,
          event: 'verified',
        });
      }
    }

    const orderToken = jwt.sign(
      { phone: tokenPhone || providedPhone },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ message: 'OTP verified successfully', orderToken });
  } catch (err) {
    console.error('[Firebase verify]', err.code || err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// @route   GET /api/otp/stats
// @desc    OTP stats for the logged-in restaurant (admin)
// @access  Protected
router.get('/stats', protect, async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalSent, totalVerified, last30Days] = await Promise.all([
      OtpLog.countDocuments({ restaurantId, event: 'sent' }),
      OtpLog.countDocuments({ restaurantId, event: 'verified' }),
      OtpLog.countDocuments({ restaurantId, event: 'sent', createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    res.json({ totalSent, totalVerified, last30Days });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
