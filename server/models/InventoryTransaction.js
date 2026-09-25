const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  restaurantId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  ingredientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  type: {
    type: String,
    enum: ['purchase-received', 'usage', 'waste', 'adjustment', 'audit'],
    required: true,
  },
  quantityChange:   { type: Number, required: true }, // positive = stock added, negative = stock removed
  unitCostAtTime:   { type: Number, required: true }, // snapshot of Ingredient.unitCost for historical valuation
  resultingStock:   { type: Number, required: true },  // Ingredient.currentStock immediately after this entry
  reason:           { type: String, default: '' },
  purchaseOrderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  performedBy:      { type: String, default: '' }, // snapshot of admin email/name
}, { timestamps: true });

inventoryTransactionSchema.index({ restaurantId: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
