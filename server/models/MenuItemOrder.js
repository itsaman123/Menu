const mongoose = require('mongoose');

const menuItemOrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  position: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Ensure one entry per item per restaurant
menuItemOrderSchema.index({ restaurantId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('MenuItemOrder', menuItemOrderSchema);
