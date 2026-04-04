const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Otp = require('../models/Otp');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const rateLimit = require('express-rate-limit');

// Strict rate-limiting for OTP Generation
const sendOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 OTP requests per 5 minutes
  message: { message: 'Too many OTP requests from this IP, please try again after 5 minutes.' }
});

// Strict rate-limiting for OTP Verification
const verifyOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 verification attempts per 5 minutes
  message: { message: 'Too many verification attempts, please try again later.' }
});

let snsClient;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  snsClient = new SNSClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });
}

// Generate 4 digit Mock OTP for testing
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// @route   POST /api/otp/send-otp
// @desc    Send OTP to a mobile number
// @access  Public
router.post('/send-otp', sendOtpLimiter, async (req, res) => {
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

  try {
    if (snsClient) {
      const message = `Your checkout OTP is ${otp}. It is valid for a few minutes.`;
      const command = new PublishCommand({
        Message: message,
        PhoneNumber: phone, // Must include country code, e.g. +91XXXXXXXXXX
      });
      await snsClient.send(command);
      console.log(`[SNS] OTP successfully sent to ${phone}`);
    } else {
      console.log(`[MOCK OTP] Send to ${phone}: ${otp}`);
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP via SNS:', error);
    res.status(500).json({ message: 'Failed to send OTP SMS' });
  }
});

// @route   POST /api/otp/verify-otp
// @desc    Verify OTP and return order token
// @access  Public
router.post('/verify-otp', verifyOtpLimiter, async (req, res) => {
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
