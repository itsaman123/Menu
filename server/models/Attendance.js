const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  date:         { type: String, required: true }, // YYYY-MM-DD
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave'],
    required: true,
  },
  checkIn:  { type: String }, // HH:MM
  checkOut: { type: String }, // HH:MM
  notes:    { type: String, trim: true },
}, { timestamps: true });

// One record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
