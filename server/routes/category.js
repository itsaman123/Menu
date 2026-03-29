const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/categories
// @desc    Get all categories for the logged in admin's restaurant
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ restaurantId: req.admin.restaurantId }).sort('order');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, order } = req.body;
    const category = new Category({
      name,
      order: order || 0,
      restaurantId: req.admin.restaurantId
    });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, order } = req.body;
    const category = await Category.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });

    if (category) {
      category.name = name || category.name;
      category.order = order !== undefined ? order : category.order;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });

    if (category) {
      await Category.deleteOne({ _id: req.params.id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
