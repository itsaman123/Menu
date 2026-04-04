const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isActive: { type: Boolean, default: true },
  disabledFeatures: [{ type: String }] // Can store keys like 'menu', 'analytics', 'qr'
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
