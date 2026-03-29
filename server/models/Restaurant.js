const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subscriptionStatus: { type: String, default: 'active', enum: ['active', 'inactive', 'trial'] },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
