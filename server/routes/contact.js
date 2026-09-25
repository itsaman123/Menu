const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const ContactSubmission = require('../models/ContactSubmission');
const { protectSuperAdmin } = require('../middleware/authMiddleware');
const { sendInquiryNotification } = require('../utils/mailer');

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many submissions, please try again later.' },
});

// @route   POST /api/contact
// @desc    Store a marketing-site contact form submission
// @access  Public
router.post('/', submitLimiter, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ message: 'Name, email and message are required' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  const submission = {
    name: name.trim().slice(0, 100),
    email: email.trim().slice(0, 200),
    phone: (phone || '').trim().slice(0, 30),
    subject: (subject || '').trim().slice(0, 200),
    message: message.trim().slice(0, 2000),
  };
  try {
    await ContactSubmission.create(submission);
    res.status(201).json({ message: 'Thanks — we\'ll get back to you soon.' });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
  try {
    await sendInquiryNotification(submission);
  } catch (err) {
    console.error('Failed to send inquiry notification email:', err.message);
  }
});

// @route   GET /api/contact
// @desc    List contact form submissions
// @access  SuperAdmin
router.get('/', protectSuperAdmin, async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort('-createdAt').limit(200);
    res.json(submissions);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
