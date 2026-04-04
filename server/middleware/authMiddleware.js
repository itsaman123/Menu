const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        return res.status(401).json({ message: 'Not authorized, admin not found' });
      }
      
      // Attach admin object with restaurantId to request
      req.admin = admin;

      // If frontend sends X-Restaurant-Id header, validate it matches the admin's restaurant
      // This prevents a compromised token from accessing another restaurant's data
      const headerRestaurantId = req.headers['x-restaurant-id'];
      if (headerRestaurantId && headerRestaurantId !== admin.restaurantId.toString()) {
        return res.status(403).json({ message: 'Restaurant ID mismatch. Access denied.' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
