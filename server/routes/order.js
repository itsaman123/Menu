const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protectCustomer } = require('../middleware/customerAuth');
const { protect, requireFeature } = require('../middleware/authMiddleware');
const Invoice = require('../models/Invoice');

// @route   POST /api/orders/create
// @desc    Create a new order (after OTP verification)
// @access  Customer (OTP verified)
router.post('/create', protectCustomer, async (req, res) => {
  try {
    const { restaurantSlug, items, tableNumber, notes } = req.body;
    
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
         quantity: item.quantity,
         notes: (item.notes || '').slice(0, 300)
       });
    }

    // GST is only added if the restaurant has it enabled, at their configured rate
    const gstEnabled = restaurant.gstEnabled !== false;
    const gstRatePct = gstEnabled ? (restaurant.gstRate ?? 5) : 0;
    const gstAmount = gstEnabled ? +(totalAmount * (gstRatePct / 100)).toFixed(2) : 0;
    const finalAmount = totalAmount + gstAmount;

    const order = new Order({
      restaurantId: restaurant._id,
      items: orderItems,
      subtotal: totalAmount,
      gstAmount,
      gstRatePct,
      totalAmount: finalAmount,
      tableNumber: tableNumber,
      notes: (notes || '').slice(0, 500),
      customerPhone: req.customer.phone
    });

    const createdOrder = await order.save();

    // Auto-generate invoice for the QR order so it appears in the billing table
    const invoiceNumber = await Invoice.generateInvoiceNumber(restaurant._id);
    const invoice = new Invoice({
      restaurantId: restaurant._id,
      invoiceNumber: invoiceNumber,
      orderId: createdOrder._id,
      customerName: `QR Customer - ${req.customer.phone}`,
      customerPhone: req.customer.phone,
      tableNumber: tableNumber || '',
      items: orderItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, notes: i.notes })),
      subtotal: totalAmount,
      gstRatePct: gstRatePct,
      gstAmount: gstAmount,
      totalAmount: finalAmount,
      status: 'pending'
    });
    await invoice.save();

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
    const orders = await Order.find({ customerPhone: req.customer.phone })
      .populate('restaurantId', 'name slug')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error getting orders' });
  }
});

// @route   GET /api/orders/restaurant
// @desc    Get all orders for the admin's restaurant (scoped by restaurantId)
// @access  Private (Admin)
router.get('/restaurant', protect, requireFeature('orders'), async (req, res) => {
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
router.put('/:id/status', protect, requireFeature('orders'), async (req, res) => {
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

      // If order is cancelled, also cancel the linked invoice
      if (status === 'cancelled') {
        await Invoice.findOneAndUpdate(
          { orderId: order._id },
          { status: 'cancelled' }
        );
      }

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
// @access  Customer (OTP verified) — must be the phone that placed the order
router.get('/:id', protectCustomer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurantId', 'name slug estimatedPrepTime');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customerPhone !== req.customer.phone) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
