const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  ingredientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  name:             { type: String, required: true },
  quantity:         { type: Number, required: true, min: 0 },
  unit:             { type: String, required: true },
  unitCost:         { type: Number, required: true, min: 0 },
  receivedQuantity: { type: Number, default: null },
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  restaurantId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  poNumber:              { type: String, required: true },
  supplierId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items:                 [poItemSchema],
  totalAmount:           { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'ordered', 'in-transit', 'received', 'cancelled'],
    default: 'draft',
  },
  orderDate:             { type: Date, default: Date.now },
  estimatedDeliveryDate: { type: Date },
  receivedDate:          { type: Date },
  notes:                 { type: String, default: '' },
}, { timestamps: true });

purchaseOrderSchema.index({ restaurantId: 1, poNumber: 1 }, { unique: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
