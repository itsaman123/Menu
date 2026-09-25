const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },
  gstRatePct: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  tableNumber: { type: String, required: false },
  notes: { type: String, default: '' },
  status: {
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  customerPhone: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
