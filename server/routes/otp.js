const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Otp = require('../models/Otp');

// Generate 4 digit Mock OTP for testing
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// @route   POST /api/otp/send-otp
// @desc    Send OTP to a mobile number
// @access  Public
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  // Mock dev environment OTP or send via Twilio/Firebase
  const otp = generateOTP();

  // Upsert OTP for phone
  await Otp.findOneAndUpdate(
    { phone },
    { otp, createdAt: Date.now() },
    { upsert: true, new: true }
  );

  console.log(`[MOCK OTP] Send to ${phone}: ${otp}`);

  res.json({ message: 'OTP sent successfully (check backend console)' });
});

// @route   POST /api/otp/verify-otp
// @desc    Verify OTP and return order token
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

  const record = await Otp.findOne({ phone, otp });

  if (!record) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  // Generate short-lived token just to allow order creation
  const orderToken = jwt.sign(
    { phone },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Clean up
  await Otp.deleteOne({ _id: record._id });

  res.json({ message: 'OTP verified successfully', orderToken });
});

module.exports = router;
