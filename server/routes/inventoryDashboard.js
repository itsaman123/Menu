const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const PurchaseOrder = require('../models/PurchaseOrder');
const InventoryTransaction = require('../models/InventoryTransaction');
const { protect, requireFeature } = require('../middleware/authMiddleware');

const OPEN_STATUSES = ['draft', 'ordered', 'in-transit'];

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function lineValue(txn) {
  return Math.abs(txn.quantityChange) * txn.unitCostAtTime;
}

// @route   GET /api/inventory/dashboard/overview
// @desc    KPI summary + 7-day stock/usage trend + recent activity feed
// @access  Private
router.get('/overview', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const restaurantId = req.admin.restaurantId;

    const ingredients = await Ingredient.find({ restaurantId, isActive: true });
    const totalValuation = +ingredients.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0).toFixed(2);
    const lowStockCount = ingredients.filter(i => i.status !== 'optimal').length;

    const openOrdersCount = await PurchaseOrder.countDocuments({ restaurantId, status: { $in: OPEN_STATUSES } });

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const recentTxns = await InventoryTransaction.find({ restaurantId, createdAt: { $gte: since } });

    const wasteValue = recentTxns.filter(t => t.type === 'waste').reduce((s, t) => s + lineValue(t), 0);
    const usageValue = recentTxns.filter(t => t.type === 'usage' || t.type === 'waste').reduce((s, t) => s + lineValue(t), 0);
    const wastePercentage = usageValue > 0 ? +((wasteValue / usageValue) * 100).toFixed(1) : 0;

    // 7-day stock-in vs usage-out trend
    const trendMap = new Map();
    for (let d = 6; d >= 0; d--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      trendMap.set(dayKey(dt), { date: dayKey(dt), stockIn: 0, usageOut: 0 });
    }
    recentTxns.forEach(t => {
      const bucket = trendMap.get(dayKey(t.createdAt));
      if (!bucket) return;
      if (t.quantityChange > 0) bucket.stockIn += lineValue(t);
      else bucket.usageOut += lineValue(t);
    });
    const trend = [...trendMap.values()].map(b => ({
      date: b.date,
      stockIn: +b.stockIn.toFixed(2),
      usageOut: +b.usageOut.toFixed(2),
    }));

    const recentActivity = await InventoryTransaction.find({ restaurantId })
      .sort('-createdAt')
      .limit(10)
      .populate('ingredientId', 'name')
      .populate('purchaseOrderId', 'poNumber');

    res.json({
      totalValuation,
      lowStockCount,
      wastePercentage,
      openOrdersCount,
      trend,
      recentActivity: recentActivity.map(t => ({
        _id: t._id,
        type: t.type,
        ingredientName: t.ingredientId?.name || 'Unknown ingredient',
        quantityChange: t.quantityChange,
        reason: t.reason,
        purchaseOrderNumber: t.purchaseOrderId?.poNumber,
        performedBy: t.performedBy,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/dashboard/activity
// @query   limit (default 20), skip (default 0)
// @access  Private
router.get('/activity', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = Number(req.query.skip) || 0;

    const records = await InventoryTransaction.find({ restaurantId: req.admin.restaurantId })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('ingredientId', 'name')
      .populate('purchaseOrderId', 'poNumber');

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/dashboard/reports/valuation-trend
// @query   days (default 30)
// @desc    Daily stock-in / usage / waste value for the last N days
// @access  Private
router.get('/reports/valuation-trend', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 180);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));

    const txns = await InventoryTransaction.find({ restaurantId: req.admin.restaurantId, createdAt: { $gte: since } });

    const buckets = new Map();
    for (let d = days - 1; d >= 0; d--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      buckets.set(dayKey(dt), { date: dayKey(dt), stockInValue: 0, usageValue: 0, wasteValue: 0 });
    }

    txns.forEach(t => {
      const bucket = buckets.get(dayKey(t.createdAt));
      if (!bucket) return;
      const value = lineValue(t);
      if (t.type === 'purchase-received') bucket.stockInValue += value;
      else if (t.type === 'usage') bucket.usageValue += value;
      else if (t.type === 'waste') bucket.wasteValue += value;
    });

    res.json([...buckets.values()].map(b => ({
      date: b.date,
      stockInValue: +b.stockInValue.toFixed(2),
      usageValue: +b.usageValue.toFixed(2),
      wasteValue: +b.wasteValue.toFixed(2),
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/dashboard/reports/top-cost-drivers
// @query   limit (default 5)
// @desc    Ingredients ranked by current inventory value (currentStock * unitCost)
// @access  Private
router.get('/reports/top-cost-drivers', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 50);
    const ingredients = await Ingredient.find({ restaurantId: req.admin.restaurantId, isActive: true });

    const withValue = ingredients
      .map(i => ({ ingredientId: i._id, name: i.name, category: i.category, value: +(i.currentStock * i.unitCost).toFixed(2) }))
      .sort((a, b) => b.value - a.value);

    const totalValue = withValue.reduce((sum, i) => sum + i.value, 0);

    res.json(withValue.slice(0, limit).map(i => ({
      ...i,
      percentageOfTotal: totalValue > 0 ? +((i.value / totalValue) * 100).toFixed(1) : 0,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/dashboard/reports/waste-by-category
// @query   days (default 30)
// @desc    Waste value grouped by ingredient category over the trailing period
// @access  Private
router.get('/reports/waste-by-category', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 180);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const wasteTxns = await InventoryTransaction.find({
      restaurantId: req.admin.restaurantId,
      type: 'waste',
      createdAt: { $gte: since },
    }).populate('ingredientId', 'category');

    const byCategory = new Map();
    wasteTxns.forEach(t => {
      const category = t.ingredientId?.category || 'Uncategorized';
      byCategory.set(category, (byCategory.get(category) || 0) + lineValue(t));
    });

    const totalWaste = [...byCategory.values()].reduce((sum, v) => sum + v, 0);

    const result = [...byCategory.entries()]
      .map(([category, value]) => ({
        category,
        value: +value.toFixed(2),
        percentageOfWaste: totalWaste > 0 ? +((value / totalWaste) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
