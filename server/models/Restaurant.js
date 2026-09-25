const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  slug:               { type: String, required: true, unique: true },
  subscriptionStatus: { type: String, default: 'active', enum: ['active', 'inactive', 'trial'] },
  gaTrackingId:       { type: String, default: '' },
  gstEnabled:         { type: Boolean, default: true },
  gstRate:            { type: Number, default: 5, min: 0, max: 100 },
  estimatedPrepTime:  { type: String, default: '15-20 mins' },
  coverImage:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
