const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const OtpLog = require('../models/OtpLog');
const Otp = require('../models/Otp');
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const { classifyDevice } = require('../utils/device');
const apitxt = require('../config/apitxt');

const sendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests, please try again after 5 minutes.' },
});

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: 'Too many verification attempts, please try again later.' },
});

// @route   POST /api/otp/send
// @desc    Generate a 6-digit OTP ourselves and dispatch it via apitxt.com SMS
// @access  Public
router.post('/send', sendLimiter, async (req, res) => {
  const { phone, slug } = req.body;
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: 'A valid 10-digit phone number is required' });
  }

  try {
    const otp = crypto.randomInt(100000, 1000000).toString();

    // apitxt only dispatches — it doesn't generate or store OTPs for us, so we
    // own that. Confirm the SMS actually went out before persisting anything.
    await apitxt.sendOtpSms(phone, otp);

    const otpHash = await bcrypt.hash(otp, 10);
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otp: otpHash });

    if (slug) {
      const restaurant = await Restaurant.findOne({ slug });
      if (restaurant) {
        const device = classifyDevice(req.headers['user-agent']);
        await OtpLog.create({ restaurantId: restaurant._id, phone: `+91${phone}`, event: 'sent', device });
      }
    }

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('[OTP send]', err.message);
    res.status(502).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// @route   POST /api/otp/verify
// @desc    Verify the OTP we generated and issue an orderToken
// @access  Public
router.post('/verify', verifyLimiter, async (req, res) => {
  const { otp, phone, slug } = req.body;
  if (!otp || !phone) {
    return res.status(400).json({ message: 'otp and phone are required' });
  }

  try {
    const record = await Otp.findOne({ phone }).sort('-createdAt');
    const matched = record && await bcrypt.compare(otp, record.otp);
    if (!matched) {
      return res.status(401).json({ message: 'Incorrect or expired OTP. Please try again.' });
    }
    await Otp.deleteOne({ _id: record._id }); // single-use

    const e164Phone = `+91${phone}`;

    if (slug) {
      const restaurant = await Restaurant.findOne({ slug });
      if (restaurant) {
        const device = classifyDevice(req.headers['user-agent']);
        await OtpLog.create({ restaurantId: restaurant._id, phone: e164Phone, event: 'verified', device });
      }
    }

    // 90d so the same token can also power the customer's "My Orders" history
    // view without re-verifying by OTP on every visit.
    const orderToken = jwt.sign(
      { phone: e164Phone },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );
    res.json({ message: 'OTP verified successfully', orderToken });
  } catch (err) {
    console.error('[OTP verify]', err.message);
    res.status(502).json({ message: 'Verification failed. Please try again.' });
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
