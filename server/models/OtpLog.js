const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  phone:        { type: String, required: true },
  event:        { type: String, enum: ['sent', 'verified'], required: true },
}, { timestamps: true });

otpLogSchema.index({ restaurantId: 1, event: 1 });

module.exports = mongoose.model('OtpLog', otpLogSchema);
