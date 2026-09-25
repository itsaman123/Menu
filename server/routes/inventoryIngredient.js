const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const InventoryTransaction = require('../models/InventoryTransaction');
const { protect, requireFeature } = require('../middleware/authMiddleware');

// @route   GET /api/inventory/ingredients
// @desc    List ingredients for the admin's restaurant
// @query   category, status ('optimal'|'low-stock'|'out-of-stock'), search
// @access  Private
router.get('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = { restaurantId: req.admin.restaurantId };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let ingredients = await Ingredient.find(filter)
      .populate('primarySupplierId', 'name')
      .sort('name');

    if (status) {
      ingredients = ingredients.filter(i => i.status === status);
    }

    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/ingredients/:id
// @access  Private
router.get('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId })
      .populate('primarySupplierId', 'name contactPerson phone');
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/ingredients
// @access  Private
router.post('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { name, category, unit, currentStock, unitCost, reorderThreshold, primarySupplierId, image } = req.body;
    if (!name || !category || !unit || unitCost === undefined) {
      return res.status(400).json({ message: 'name, category, unit and unitCost are required' });
    }

    const ingredient = await Ingredient.create({
      restaurantId: req.admin.restaurantId,
      name,
      category,
      unit,
      currentStock: currentStock !== undefined ? Number(currentStock) : 0,
      unitCost: Number(unitCost),
      reorderThreshold: reorderThreshold !== undefined ? Number(reorderThreshold) : 0,
      primarySupplierId: primarySupplierId || undefined,
      image,
    });

    res.status(201).json(ingredient);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/ingredients/:id
// @desc    Update ingredient metadata (not for stock changes — use /:id/adjust)
// @access  Private
router.put('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });

    const allowed = ['name', 'category', 'unit', 'unitCost', 'reorderThreshold', 'primarySupplierId', 'image', 'isActive'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) ingredient[field] = req.body[field];
    });

    const updated = await ingredient.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/ingredients/:id
// @access  Private
router.delete('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const deleted = await Ingredient.findOneAndDelete({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!deleted) return res.status(404).json({ message: 'Ingredient not found' });
    res.json({ message: 'Ingredient deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/ingredients/:id/adjust
// @desc    Manually adjust stock (waste, audit correction, generic adjustment).
//          Purchase receipts are handled via /api/inventory/purchase-orders/:id/receive instead.
// @body    { quantityChange: Number, type: 'adjustment'|'waste'|'audit', reason?: String }
// @access  Private
router.post('/:id/adjust', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { quantityChange, type, reason } = req.body;
    const allowedTypes = ['adjustment', 'waste', 'audit'];

    if (quantityChange === undefined || Number(quantityChange) === 0) {
      return res.status(400).json({ message: 'A non-zero quantityChange is required' });
    }
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${allowedTypes.join(', ')}` });
    }

    const ingredient = await Ingredient.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });

    const nextStock = ingredient.currentStock + Number(quantityChange);
    if (nextStock < 0) {
      return res.status(400).json({ message: `Adjustment would drop stock below zero (current: ${ingredient.currentStock})` });
    }

    ingredient.currentStock = nextStock;
    await ingredient.save();

    const transaction = await InventoryTransaction.create({
      restaurantId: req.admin.restaurantId,
      ingredientId: ingredient._id,
      type,
      quantityChange: Number(quantityChange),
      unitCostAtTime: ingredient.unitCost,
      resultingStock: nextStock,
      reason: reason || '',
      performedBy: req.admin.email,
    });

    res.status(201).json({ ingredient, transaction });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
