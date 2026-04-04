require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const menuItemRoutes = require('./routes/menuItem');
const publicRoutes = require('./routes/public');
const uploadRoutes = require('./routes/upload');
const otpRoutes = require('./routes/otp');
const orderRoutes = require('./routes/order');
const superadminRoutes = require('./routes/superadmin');

const app = express();

// Security Middlewares
app.use(helmet());            // Set security HTTP headers
app.use(mongoSanitize());     // Prevent NoSQL injection
app.use(hpp());               // Prevent HTTP Parameter Pollution

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);
app.use('/auth/', apiLimiter);

// Standard Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/public', publicRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
