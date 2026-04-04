const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protectCustomer } = require('../middleware/customerAuth');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/orders/create
// @desc    Create a new order (after OTP verification)
// @access  Customer (OTP verified)
router.post('/create', protectCustomer, async (req, res) => {
  try {
    const { restaurantSlug, items } = req.body;
    
    if (!restaurantSlug || !items || items.length === 0) {
      return res.status(400).json({ message: 'Restaurant slug and items are required' });
    }

    // Find restaurant by slug — this is how public menu pages identify the restaurant
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    let totalAmount = 0;
    const orderItems = [];

    // Server-side price verification — never trust frontend prices
    for (const item of items) {
       const menuItem = await MenuItem.findById(item.menuItemId);
       
       // Verify item exists AND belongs to this restaurant (multi-tenant security)
       if (!menuItem || menuItem.restaurantId.toString() !== restaurant._id.toString()) {
           return res.status(400).json({ message: `Invalid item: ${item.name}` });
       }
       if (!menuItem.isAvailable) {
           return res.status(400).json({ message: `Item out of stock: ${item.name}` });
       }
       
       totalAmount += menuItem.price * item.quantity;
       orderItems.push({
         menuItemId: menuItem._id,
         name: menuItem.name,
         price: menuItem.price,
         quantity: item.quantity
       });
    }

    // Add 5% GST
    const finalAmount = totalAmount * 1.05;

    const order = new Order({
      restaurantId: restaurant._id,
      items: orderItems,
      totalAmount: finalAmount,
      customerPhone: req.customer.phone
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error placing order' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get all orders for the verified customer phone
// @access  Customer (OTP verified)
router.get('/my-orders', protectCustomer, async (req, res) => {
  try {
    const orders = await Order.find({ customerPhone: req.customer.phone }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error getting orders' });
  }
});

// @route   GET /api/orders/restaurant
// @desc    Get all orders for the admin's restaurant (scoped by restaurantId)
// @access  Private (Admin)
router.get('/restaurant', protect, async (req, res) => {
  try {
    // req.admin.restaurantId comes from the JWT-decoded admin record
    // This ensures Restaurant A's admin can ONLY see Restaurant A's orders
    const orders = await Order.find({ restaurantId: req.admin.restaurantId }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only, scoped to their restaurant)
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // CRITICAL: Scope by restaurantId to prevent cross-restaurant order manipulation
    const order = await Order.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });

    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details (for customer order tracking page)
// @access  Public (order ID is hard to guess, serves as an access token)
// NOTE:    In production, add proper auth (customer OTP token) for this endpoint
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurantId', 'name slug');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
