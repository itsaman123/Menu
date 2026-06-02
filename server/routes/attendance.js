const express = require('express');
const router  = express.Router();
const Attendance = require('../models/Attendance');
const Employee   = require('../models/Employee');
const { protect } = require('../middleware/authMiddleware');

// GET attendance records
// Query: ?date=YYYY-MM-DD  |  ?month=YYYY-MM  |  ?employeeId=xxx
router.get('/', protect, async (req, res) => {
  try {
    const { employeeId, month, date } = req.query;
    const filter = { restaurantId: req.admin.restaurantId };

    if (employeeId) filter.employeeId = employeeId;
    if (date)       filter.date = date;
    else if (month) filter.date = { $regex: `^${month}` };

    const records = await Attendance.find(filter)
      .populate('employeeId', 'name role monthlySalary')
      .sort('-date');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET salary summary for a month
// Query: ?month=YYYY-MM
router.get('/salary-summary', protect, async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM)' });

    const [yr, mo] = month.split('-').map(Number);
    const totalDaysInMonth = new Date(yr, mo, 0).getDate();

    const employees = await Employee.find({ restaurantId: req.admin.restaurantId });

    const summaries = await Promise.all(employees.map(async (emp) => {
      const records = await Attendance.find({
        employeeId: emp._id,
        date: { $regex: `^${month}` },
      });

      const presentDays = records.filter(r => r.status === 'present').length;
      const halfDays    = records.filter(r => r.status === 'half-day').length;
      const absentDays  = records.filter(r => r.status === 'absent').length;
      const leaveDays   = records.filter(r => r.status === 'leave').length;
      const workedDays  = presentDays + halfDays * 0.5;
      const calculatedSalary = Math.round((emp.monthlySalary / totalDaysInMonth) * workedDays);

      return {
        employee: {
          _id: emp._id,
          name: emp.name,
          role: emp.role,
          monthlySalary: emp.monthlySalary,
          isActive: emp.isActive,
        },
        presentDays,
        halfDays,
        absentDays,
        leaveDays,
        totalMarked: records.length,
        totalDaysInMonth,
        workedDays,
        calculatedSalary,
      };
    }));

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST upsert attendance for a single employee on a date
router.post('/', protect, async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: 'employeeId, date and status are required' });
    }

    const emp = await Employee.findOne({ _id: employeeId, restaurantId: req.admin.restaurantId });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const record = await Attendance.findOneAndUpdate(
      { employeeId, date },
      { employeeId, restaurantId: req.admin.restaurantId, date, status, checkIn, checkOut, notes },
      { upsert: true, new: true }
    );
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST bulk attendance for a date
// Body: { date: 'YYYY-MM-DD', records: [{ employeeId, status, checkIn?, checkOut?, notes? }] }
router.post('/bulk', protect, async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'date and records array are required' });
    }

    // Verify employees belong to this restaurant
    const empIds = records.map(r => r.employeeId);
    const validEmps = await Employee.find({ _id: { $in: empIds }, restaurantId: req.admin.restaurantId });
    const validIdSet = new Set(validEmps.map(e => e._id.toString()));

    const ops = records
      .filter(r => validIdSet.has(r.employeeId))
      .map(r => ({
        updateOne: {
          filter: { employeeId: r.employeeId, date },
          update: {
            $set: {
              employeeId:   r.employeeId,
              restaurantId: req.admin.restaurantId,
              date,
              status:   r.status,
              checkIn:  r.checkIn  || null,
              checkOut: r.checkOut || null,
              notes:    r.notes    || null,
            },
          },
          upsert: true,
        },
      }));

    if (ops.length) await Attendance.bulkWrite(ops);
    res.json({ message: `Saved ${ops.length} attendance records` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
