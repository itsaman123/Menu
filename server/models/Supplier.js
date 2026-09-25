const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  restaurantId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:               { type: String, required: true, trim: true },
  category:           { type: String, trim: true, default: '' }, // e.g. "Premium Butchery"
  contactPerson:      { type: String, trim: true, default: '' },
  phone:              { type: String, trim: true, default: '' },
  email:              { type: String, trim: true, lowercase: true, default: '' },
  address:            { type: String, trim: true, default: '' },
  outstandingPayment: { type: Number, default: 0, min: 0 },
  isActive:           { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
