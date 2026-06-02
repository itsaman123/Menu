const express = require('express');
const router  = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/authMiddleware');

// GET all employees for admin's restaurant
router.get('/', protect, async (req, res) => {
  try {
    const employees = await Employee.find({ restaurantId: req.admin.restaurantId }).sort('-createdAt');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create employee
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, email, role, monthlySalary } = req.body;
    if (!name || !phone || monthlySalary === undefined) {
      return res.status(400).json({ message: 'Name, phone and monthlySalary are required' });
    }
    const employee = await Employee.create({
      restaurantId: req.admin.restaurantId,
      name, phone, email, role, monthlySalary: Number(monthlySalary),
    });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update employee
router.put('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const allowed = ['name', 'phone', 'email', 'role', 'monthlySalary', 'isActive'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    const updated = await employee.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE employee
router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await Employee.findOneAndDelete({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!deleted) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
