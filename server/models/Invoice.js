const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String, default: '' }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  invoiceNumber: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },

  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  customerType: { type: String, enum: ['walk-in', 'reservation', 'corporate'], default: 'walk-in' },
  tableNumber: { type: String, default: '' },
  guestCount: { type: Number, default: 0 },

  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  gstRatePct: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  discountPct: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  tipAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  paymentMethod: { type: String, enum: ['cash', 'card', 'upi'], default: 'cash' },
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  dueDate: { type: Date, default: null },
  paidAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

invoiceSchema.index({ restaurantId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ restaurantId: 1, status: 1 });

invoiceSchema.statics.generateInvoiceNumber = async function(restaurantId) {
  const count = await this.countDocuments({ restaurantId });
  return `INV-${1000 + count + 1}`;
};

module.exports = mongoose.model('Invoice', invoiceSchema);
