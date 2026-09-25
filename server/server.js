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
const employeeRoutes = require('./routes/employee');
const attendanceRoutes = require('./routes/attendance');
const contactRoutes = require('./routes/contact');
const inventoryIngredientRoutes = require('./routes/inventoryIngredient');
const inventorySupplierRoutes = require('./routes/inventorySupplier');
const inventoryPurchaseOrderRoutes = require('./routes/inventoryPurchaseOrder');
const inventoryRecipeRoutes = require('./routes/inventoryRecipe');
const inventoryDashboardRoutes = require('./routes/inventoryDashboard');
const billingRoutes = require('./routes/billing');

const app = express();

// Standard Middleware
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin requests for resources
// app.use(mongoSanitize());     // Removed: crashes Express 5 by reassigning req.query
// app.use(hpp());               // Removed: crashes Express 5

const jwt = require('jsonwebtoken');

// Global Rate Limiting (Exempts authenticated Admins & Admin routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per 15 minutes
  message: { message: 'Too many requests from this IP, please try again later.' },
  skip: (req) => {
    // 1. Skip rate limiting if request carries a valid Bearer token (Admin / SuperAdmin)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          jwt.verify(token, process.env.JWT_SECRET);
          return true; // Exclude authenticated admin requests from rate limiting
        }
      } catch (err) {
        // Invalid or expired token
      }
    }

    // 2. Skip rate limiting for admin routes & admin authentication endpoints
    const adminRoutes = [
      '/auth',
      '/api/superadmin',
      '/api/categories',
      '/api/menu-items',
      '/api/upload',
      '/api/employees',
      '/api/attendance',
      '/api/inventory',
      '/api/billing'
    ];
    const url = req.originalUrl || req.url || '';
    if (adminRoutes.some(route => url.startsWith(route))) {
      return true;
    }

    return false;
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(req.method, req.originalUrl);
    next();
  });
}

app.use('/api/', apiLimiter);
app.use('/auth/', apiLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/inventory/ingredients', inventoryIngredientRoutes);
app.use('/api/inventory/suppliers', inventorySupplierRoutes);
app.use('/api/inventory/purchase-orders', inventoryPurchaseOrderRoutes);
app.use('/api/inventory/recipes', inventoryRecipeRoutes);
app.use('/api/inventory/dashboard', inventoryDashboardRoutes);
app.use('/api/billing', billingRoutes);
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
