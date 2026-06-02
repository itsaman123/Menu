const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:         { type: String, required: true, trim: true },
  phone:        { type: String, required: true, trim: true },
  email:        { type: String, trim: true, lowercase: true },
  role: {
    type: String,
    enum: ['manager', 'waiter', 'chef', 'cashier', 'delivery', 'other'],
    default: 'other',
  },
  monthlySalary: { type: Number, required: true, min: 0 },
  isActive:      { type: Boolean, default: true },
  joinedAt:      { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
