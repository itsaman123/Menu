const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItemOrder = require('../models/MenuItemOrder');
const { protect, requireFeature } = require('../middleware/authMiddleware');

const STATUSES = ['draft', 'pending', 'paid', 'overdue', 'cancelled'];
const PAYMENT_METHODS = ['cash', 'card', 'upi'];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function round2(n) {
  return +Number(n || 0).toFixed(2);
}


// Builds subtotal/gst/discount/total from raw items + rates. Never trusts client-sent totals.
function computeAmounts({ items, gstRatePct = 0, discountPct = 0 }) {
  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const gstAmount = round2(subtotal * (gstRatePct / 100));
  const discountAmount = round2(subtotal * (discountPct / 100));
  const totalAmount = round2(subtotal + gstAmount - discountAmount);
  return { subtotal, gstAmount, discountAmount, totalAmount };
}

// @route   GET /api/billing/overview
// @desc    KPI summary for the Billing & Payments dashboard (current calendar month)
// @access  Private
router.get('/overview', protect, requireFeature('billing'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [paidThisMonth, paidLastMonth, pendingInvoices, paidCount, overdueCount] = await Promise.all([
      Invoice.find({ restaurantId, status: 'paid', createdAt: { $gte: thisMonthStart } }),
      Invoice.find({ restaurantId, status: 'paid', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
      Invoice.find({ restaurantId, status: 'pending' }),
      Invoice.countDocuments({ restaurantId, status: 'paid', createdAt: { $gte: thisMonthStart } }),
      Invoice.countDocuments({ restaurantId, status: 'overdue' })
    ]);

    const totalRevenue = round2(paidThisMonth.reduce((s, i) => s + i.totalAmount, 0));
    const lastMonthRevenue = round2(paidLastMonth.reduce((s, i) => s + i.totalAmount, 0));
    const revenueGrowthPct = lastMonthRevenue > 0
      ? round2(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : null;

    const pendingAmount = round2(pendingInvoices.reduce((s, i) => s + i.totalAmount, 0));
    const bills = paidThisMonth.map(i => i.totalAmount);
    const averageBill = bills.length ? round2(bills.reduce((s, b) => s + b, 0) / bills.length) : 0;
    const highestSale = bills.length ? round2(Math.max(...bills)) : 0;
    const gstCollected = round2(paidThisMonth.reduce((s, i) => s + i.gstAmount, 0));
    const tipsShared = round2(paidThisMonth.reduce((s, i) => s + i.tipAmount, 0));

    res.json({
      totalRevenue,
      revenueGrowthPct,
      pendingAmount,
      pendingCount: pendingInvoices.length,
      paidInvoicesCount: paidCount,
      overdueCount,
      averageBill,
      highestSale,
      gstCollected,
      tipsShared
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/revenue-trend
// @query   weeks (default 4, max 6) - number of weekly buckets
// @desc    Paid revenue this month vs the same weeks last month, for the trend chart
// @access  Private
router.get('/revenue-trend', protect, requireFeature('billing'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const weeks = Math.min(Number(req.query.weeks) || 4, 6);
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const nextMonthStart = new Date(thisMonthStart);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

    const [current, previous] = await Promise.all([
      Invoice.find({ restaurantId, status: 'paid', createdAt: { $gte: thisMonthStart, $lt: nextMonthStart } }),
      Invoice.find({ restaurantId, status: 'paid', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } })
    ]);

    const bucketOf = (date, monthStart) => Math.min(Math.floor((date.getDate() - 1) / 7), weeks - 1);

    const currentBuckets = Array(weeks).fill(0);
    current.forEach(inv => { currentBuckets[bucketOf(inv.createdAt, thisMonthStart)] += inv.totalAmount; });

    const previousBuckets = Array(weeks).fill(0);
    previous.forEach(inv => { previousBuckets[bucketOf(inv.createdAt, lastMonthStart)] += inv.totalAmount; });

    const trend = Array.from({ length: weeks }, (_, i) => ({
      week: `Week ${i + 1}`,
      current: round2(currentBuckets[i]),
      previous: round2(previousBuckets[i])
    }));

    res.json(trend);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/orders/unbilled
// @desc    Completed orders that don't have an invoice yet, to power the "Table Selection" picker
// @access  Private
router.get('/orders/unbilled', protect, requireFeature('billing'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const billedOrderIds = await Invoice.find({ restaurantId, orderId: { $ne: null } }).distinct('orderId');

    const orders = await Order.find({
      restaurantId,
      status: 'completed',
      _id: { $nin: billedOrderIds }
    }).sort('-createdAt');

    res.json(orders.map(o => ({
      orderId: o._id,
      tableNumber: o.tableNumber,
      customerPhone: o.customerPhone,
      items: o.items,
      subtotal: o.subtotal,
      gstRatePct: o.gstRatePct,
      gstAmount: o.gstAmount,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/invoices
// @query   status, search, page (default 1), limit (default 20)
// @desc    Paginated "Recent Invoices" table
// @access  Private
router.get('/invoices', protect, requireFeature('billing'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const { status, search } = req.query;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const query = { restaurantId };
    if (status && STATUSES.includes(status)) query.status = status;
    if (search) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [{ invoiceNumber: re }, { customerName: re }, { tableNumber: re }];
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Invoice.countDocuments(query)
    ]);

    res.json({
      invoices,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/invoices/export
// @query   status, search (same filters as the list endpoint)
// @desc    CSV download of matching invoices
// @access  Private
router.get('/invoices/export', protect, requireFeature('billing'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const { status, search } = req.query;

    const query = { restaurantId };
    if (status && STATUSES.includes(status)) query.status = status;
    if (search) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [{ invoiceNumber: re }, { customerName: re }, { tableNumber: re }];
    }

    const invoices = await Invoice.find(query).sort('-createdAt');

    const header = ['Invoice #', 'Date', 'Customer', 'Table', 'Amount', 'Method', 'Status'];
    const rows = invoices.map(i => [
      i.invoiceNumber,
      i.createdAt.toISOString().slice(0, 10),
      i.customerName,
      i.tableNumber,
      i.totalAmount,
      i.paymentMethod,
      i.status
    ]);
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map(r => r.map(escape).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/invoices/:id
// @desc    Single invoice detail
// @access  Private
router.get('/invoices/:id', protect, requireFeature('billing'), async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId }).lean();
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    const restaurant = await Restaurant.findById(req.admin.restaurantId).select('name');
    invoice.restaurantName = restaurant ? restaurant.name : 'Restaurant';
    
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/invoices
// @desc    Create an invoice ("Create Invoice" screen) - either from an existing order or manual items
// @access  Private
router.post('/invoices', protect, requireFeature('billing'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const {
      orderId, customerName, customerPhone, customerType, tableNumber, guestCount,
      items, gstRatePct, discountPct, paymentMethod, dueDate, saveAsDraft, notes
    } = req.body;

    if (!customerName) return res.status(400).json({ message: 'Customer name is required' });

    let invoiceItems = items;
    let linkedOrder = null;

    if (orderId) {
      linkedOrder = await Order.findOne({ _id: orderId, restaurantId });
      if (!linkedOrder) return res.status(404).json({ message: 'Order not found' });

      const alreadyBilled = await Invoice.exists({ restaurantId, orderId });
      if (alreadyBilled) return res.status(400).json({ message: 'This order has already been invoiced' });

      invoiceItems = linkedOrder.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, notes: i.notes }));
    }

    if (!Array.isArray(invoiceItems) || invoiceItems.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }
    for (const item of invoiceItems) {
      if (!item.name || !(item.price >= 0) || !(item.quantity >= 1)) {
        return res.status(400).json({ message: 'Each item needs a name, price, and quantity' });
      }
    }

    const restaurant = await Restaurant.findById(restaurantId);
    const resolvedGstRatePct = gstRatePct != null ? Number(gstRatePct) : (restaurant?.gstRate ?? 0);
    const resolvedDiscountPct = discountPct != null ? Number(discountPct) : 0;

    const { subtotal, gstAmount, discountAmount, totalAmount } = computeAmounts({
      items: invoiceItems,
      gstRatePct: resolvedGstRatePct,
      discountPct: resolvedDiscountPct
    });

    const invoice = await Invoice.create({
      restaurantId,
      invoiceNumber: await Invoice.generateInvoiceNumber(restaurantId),
      orderId: linkedOrder ? linkedOrder._id : null,
      customerName,
      customerPhone: customerPhone || linkedOrder?.customerPhone || '',
      customerType: ['walk-in', 'reservation', 'corporate'].includes(customerType) ? customerType : 'walk-in',
      tableNumber: tableNumber || linkedOrder?.tableNumber || '',
      guestCount: guestCount || 0,
      items: invoiceItems,
      subtotal,
      gstRatePct: resolvedGstRatePct,
      gstAmount,
      discountPct: resolvedDiscountPct,
      discountAmount,
      totalAmount,
      paymentMethod: PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'cash',
      status: saveAsDraft ? 'draft' : 'pending',
      dueDate: dueDate || null,
      notes: (notes || '').slice(0, 500)
    });

    const invoiceData = invoice.toObject();
    invoiceData.restaurantName = restaurant ? restaurant.name : 'Restaurant';

    res.status(201).json(invoiceData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating invoice' });
  }
});

// @route   PUT /api/billing/invoices/:id
// @desc    Edit an invoice while it's still a draft or pending
// @access  Private
router.put('/invoices/:id', protect, requireFeature('billing'), async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (!['draft', 'pending'].includes(invoice.status)) {
      return res.status(400).json({ message: `Cannot edit an invoice with status '${invoice.status}'` });
    }

    const {
      customerName, customerPhone, customerType, tableNumber, guestCount,
      items, gstRatePct, discountPct, paymentMethod, dueDate, saveAsDraft, notes
    } = req.body;

    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'At least one item is required' });
      }
      for (const item of items) {
        if (!item.name || !(item.price >= 0) || !(item.quantity >= 1)) {
          return res.status(400).json({ message: 'Each item needs a name, price, and quantity' });
        }
      }
      invoice.items = items;
    }

    if (customerName) invoice.customerName = customerName;
    if (customerPhone != null) invoice.customerPhone = customerPhone;
    if (customerType && ['walk-in', 'reservation', 'corporate'].includes(customerType)) invoice.customerType = customerType;
    if (tableNumber != null) invoice.tableNumber = tableNumber;
    if (guestCount != null) invoice.guestCount = guestCount;
    if (paymentMethod && PAYMENT_METHODS.includes(paymentMethod)) invoice.paymentMethod = paymentMethod;
    if (dueDate !== undefined) invoice.dueDate = dueDate;
    if (notes != null) invoice.notes = (notes || '').slice(0, 500);
    if (gstRatePct != null) invoice.gstRatePct = Number(gstRatePct);
    if (discountPct != null) invoice.discountPct = Number(discountPct);

    const { subtotal, gstAmount, discountAmount, totalAmount } = computeAmounts({
      items: invoice.items,
      gstRatePct: invoice.gstRatePct,
      discountPct: invoice.discountPct
    });
    invoice.subtotal = subtotal;
    invoice.gstAmount = gstAmount;
    invoice.discountAmount = discountAmount;
    invoice.totalAmount = totalAmount;

    if (saveAsDraft !== undefined) invoice.status = saveAsDraft ? 'draft' : 'pending';

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating invoice' });
  }
});

// @route   PUT /api/billing/invoices/:id/status
// @desc    Manually change an invoice's status (e.g. flag as overdue, cancel)
// @access  Private
router.put('/invoices/:id/status', protect, requireFeature('billing'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${STATUSES.join(', ')}` });
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.status = status;
    if (status === 'paid' && !invoice.paidAt) invoice.paidAt = new Date();
    await invoice.save();

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/invoices/:id/payment
// @desc    "Add Payment" - record payment against an existing invoice and mark it paid
// @access  Private
router.post('/invoices/:id/payment', protect, requireFeature('billing'), async (req, res) => {
  try {
    const { paymentMethod, tipAmount } = req.body;
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(', ')}` });
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'paid') return res.status(400).json({ message: 'Invoice is already paid' });
    if (invoice.status === 'cancelled') return res.status(400).json({ message: 'Cannot pay a cancelled invoice' });

    invoice.paymentMethod = paymentMethod;
    invoice.tipAmount = tipAmount != null ? round2(tipAmount) : invoice.tipAmount;
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error recording payment' });
  }
});

// @route   GET /api/billing/menu-item-order
// @desc    Get saved menu item ordering for the POS catalog
// @access  Private
router.get('/menu-item-order', protect, requireFeature('billing'), async (req, res) => {
  try {
    const orders = await MenuItemOrder.find({ restaurantId: req.admin.restaurantId })
      .sort('position')
      .select('itemId position -_id');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/billing/menu-item-order
// @desc    Save menu item ordering for the POS catalog (drag-and-drop)
// @body    { items: [{ itemId, position }] }
// @access  Private
router.put('/menu-item-order', protect, requireFeature('billing'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items array is required' });
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { restaurantId, itemId: item.itemId },
        update: { $set: { position: item.position } },
        upsert: true
      }
    }));

    await MenuItemOrder.bulkWrite(bulkOps);
    res.json({ message: 'Order saved', count: items.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving order' });
  }
});

module.exports = router;
