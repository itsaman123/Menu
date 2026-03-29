const jwt = require('jsonwebtoken');

exports.protectCustomer = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded.phone) {
        return res.status(401).json({ message: 'Not authorized as a verified customer' });
      }
      
      req.customer = { phone: decoded.phone };
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token failed, session expired. Please verify again.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
