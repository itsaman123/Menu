const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const { protect, requireFeature } = require('../middleware/authMiddleware');

// @route   GET /api/inventory/suppliers
// @access  Private
router.get('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const suppliers = await Supplier.find({ restaurantId: req.admin.restaurantId }).sort('name');
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/suppliers/:id
// @desc    Supplier profile, including a count of active purchase orders
// @access  Private
router.get('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const activePOs = await PurchaseOrder.countDocuments({
      restaurantId: req.admin.restaurantId,
      supplierId: supplier._id,
      status: { $in: ['draft', 'ordered', 'in-transit'] },
    });

    res.json({ ...supplier.toObject(), activePOs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/suppliers
// @access  Private
router.post('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { name, category, contactPerson, phone, email, address, outstandingPayment } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });

    const supplier = await Supplier.create({
      restaurantId: req.admin.restaurantId,
      name, category, contactPerson, phone, email, address,
      outstandingPayment: outstandingPayment !== undefined ? Number(outstandingPayment) : 0,
    });

    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/suppliers/:id
// @access  Private
router.put('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const allowed = ['name', 'category', 'contactPerson', 'phone', 'email', 'address', 'outstandingPayment', 'isActive'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) supplier[field] = req.body[field];
    });

    const updated = await supplier.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/suppliers/:id
// @access  Private
router.delete('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const deleted = await Supplier.findOneAndDelete({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!deleted) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
