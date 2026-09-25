const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  restaurantId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:              { type: String, required: true, trim: true },
  category:          { type: String, required: true, trim: true }, // e.g. Produce, Dairy, Meat, Seafood, Pantry, Beverage
  unit:              { type: String, required: true, trim: true }, // e.g. kg, g, L, ml, pcs, dozen
  currentStock:      { type: Number, required: true, default: 0, min: 0 },
  unitCost:          { type: Number, required: true, min: 0 },
  reorderThreshold:  { type: Number, default: 0, min: 0 },
  primarySupplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  image:             { type: String, default: '' },
  isActive:          { type: Boolean, default: true },
}, { timestamps: true });

ingredientSchema.virtual('status').get(function () {
  if (this.currentStock <= 0) return 'out-of-stock';
  if (this.currentStock <= this.reorderThreshold) return 'low-stock';
  return 'optimal';
});

ingredientSchema.set('toJSON', { virtuals: true });
ingredientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);
