const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Ingredient = require('../models/Ingredient');
const InventoryTransaction = require('../models/InventoryTransaction');
const { protect, requireFeature } = require('../middleware/authMiddleware');

const OPEN_STATUSES = ['draft', 'ordered', 'in-transit'];

async function generatePoNumber(restaurantId) {
  const now = new Date();
  const prefix = `PO-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`;
  const count = await PurchaseOrder.countDocuments({ restaurantId, poNumber: { $regex: `^${prefix}` } });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
}

// Validates & normalizes the `items` array from a request body against this restaurant's ingredients.
async function buildItems(restaurantId, rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: 'items array is required and must not be empty' };
  }

  const ingredientIds = rawItems.map(i => i.ingredientId);
  const ingredients = await Ingredient.find({ _id: { $in: ingredientIds }, restaurantId });
  const ingredientMap = new Map(ingredients.map(i => [i._id.toString(), i]));

  const items = [];
  for (const raw of rawItems) {
    const ingredient = ingredientMap.get(String(raw.ingredientId));
    if (!ingredient) return { error: `Ingredient ${raw.ingredientId} not found` };

    const quantity = Number(raw.quantity);
    const unitCost = raw.unitCost !== undefined ? Number(raw.unitCost) : ingredient.unitCost;
    if (!quantity || quantity <= 0) return { error: `Invalid quantity for ${ingredient.name}` };

    items.push({
      ingredientId: ingredient._id,
      name: ingredient.name,
      quantity,
      unit: ingredient.unit,
      unitCost,
    });
  }

  return { items };
}

// @route   GET /api/inventory/purchase-orders
// @query   status
// @access  Private
router.get('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { restaurantId: req.admin.restaurantId };
    if (status) filter.status = status;

    const orders = await PurchaseOrder.find(filter)
      .populate('supplierId', 'name')
      .sort('-orderDate');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/purchase-orders/:id
// @access  Private
router.get('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId })
      .populate('supplierId', 'name contactPerson phone email');
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/purchase-orders
// @body    { supplierId, items: [{ ingredientId, quantity, unitCost? }], estimatedDeliveryDate?, notes?, status? }
// @access  Private
router.post('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { supplierId, items: rawItems, estimatedDeliveryDate, notes, status } = req.body;
    if (!supplierId) return res.status(400).json({ message: 'supplierId is required' });

    const { items, error } = await buildItems(req.admin.restaurantId, rawItems);
    if (error) return res.status(400).json({ message: error });

    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const initialStatus = ['draft', 'ordered'].includes(status) ? status : 'ordered';

    const order = await PurchaseOrder.create({
      restaurantId: req.admin.restaurantId,
      poNumber: await generatePoNumber(req.admin.restaurantId),
      supplierId,
      items,
      totalAmount,
      status: initialStatus,
      estimatedDeliveryDate,
      notes: notes || '',
    });

    res.status(201).json(order);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'PO number collision, please retry' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/purchase-orders/:id
// @desc    Update a PO's items/supplier/dates/notes. Only allowed while still open (not received/cancelled).
// @access  Private
router.put('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    if (!OPEN_STATUSES.includes(order.status)) {
      return res.status(400).json({ message: `Cannot edit a ${order.status} purchase order` });
    }

    const { supplierId, items: rawItems, estimatedDeliveryDate, notes } = req.body;

    if (rawItems !== undefined) {
      const { items, error } = await buildItems(req.admin.restaurantId, rawItems);
      if (error) return res.status(400).json({ message: error });
      order.items = items;
      order.totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    }
    if (supplierId !== undefined) order.supplierId = supplierId;
    if (estimatedDeliveryDate !== undefined) order.estimatedDeliveryDate = estimatedDeliveryDate;
    if (notes !== undefined) order.notes = notes;

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/purchase-orders/:id/status
// @desc    Transition status among draft/ordered/in-transit/cancelled.
//          Use POST /:id/receive to mark as received (it also updates stock).
// @body    { status }
// @access  Private
router.put('/:id/status', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'ordered', 'in-transit', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }

    const order = await PurchaseOrder.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    if (order.status === 'received') {
      return res.status(400).json({ message: 'A received purchase order cannot change status' });
    }

    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/purchase-orders/:id/receive
// @desc    Receiving workflow — records delivered quantities, restocks ingredients,
//          and writes a purchase-received InventoryTransaction per item.
// @body    { items: [{ ingredientId, receivedQuantity }] }  (omitted items default to the ordered quantity)
// @access  Private
router.post('/:id/receive', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    if (!OPEN_STATUSES.includes(order.status)) {
      return res.status(400).json({ message: `Cannot receive a ${order.status} purchase order` });
    }

    const receivedMap = new Map(
      (req.body.items || []).map(i => [String(i.ingredientId), Number(i.receivedQuantity)])
    );

    const transactions = [];
    for (const item of order.items) {
      const receivedQuantity = receivedMap.has(String(item.ingredientId))
        ? receivedMap.get(String(item.ingredientId))
        : item.quantity;

      if (receivedQuantity < 0) {
        return res.status(400).json({ message: `Invalid received quantity for ${item.name}` });
      }
      item.receivedQuantity = receivedQuantity;
      if (receivedQuantity === 0) continue;

      const ingredient = await Ingredient.findOne({ _id: item.ingredientId, restaurantId: req.admin.restaurantId });
      if (!ingredient) continue; // ingredient may have been deleted since the PO was created

      ingredient.currentStock += receivedQuantity;
      await ingredient.save();

      transactions.push({
        restaurantId: req.admin.restaurantId,
        ingredientId: ingredient._id,
        type: 'purchase-received',
        quantityChange: receivedQuantity,
        unitCostAtTime: item.unitCost,
        resultingStock: ingredient.currentStock,
        reason: `Received against ${order.poNumber}`,
        purchaseOrderId: order._id,
        performedBy: req.admin.email,
      });
    }

    if (transactions.length) await InventoryTransaction.insertMany(transactions);

    order.status = 'received';
    order.receivedDate = new Date();
    const updated = await order.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/purchase-orders/:id
// @desc    Only draft POs can be deleted outright; use the status endpoint to cancel an active one.
// @access  Private
router.delete('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const order = await PurchaseOrder.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    if (order.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft purchase orders can be deleted; cancel it instead' });
    }

    await PurchaseOrder.deleteOne({ _id: order._id });
    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
