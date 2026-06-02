const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  slug:               { type: String, required: true, unique: true },
  subscriptionStatus: { type: String, default: 'active', enum: ['active', 'inactive', 'trial'] },
  gaTrackingId:       { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
