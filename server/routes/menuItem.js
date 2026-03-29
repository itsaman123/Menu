const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/menu-items
// @desc    Get all menu items for the logged in admin's restaurant
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.admin.restaurantId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/menu-items
// @desc    Create a menu item
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, price, image, categoryId, isAvailable } = req.body;
    
    const menuItem = new MenuItem({
      name,
      description,
      price,
      image,
      categoryId,
      restaurantId: req.admin.restaurantId,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    const createdItem = await menuItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/menu-items/:id
// @desc    Update a menu item
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, price, image, categoryId, isAvailable } = req.body;
    const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });

    if (item) {
      item.name = name || item.name;
      item.description = description !== undefined ? description : item.description;
      item.price = price || item.price;
      item.image = image || item.image;
      item.categoryId = categoryId || item.categoryId;
      item.isAvailable = isAvailable !== undefined ? isAvailable : item.isAvailable;

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/menu-items/:id
// @desc    Delete a menu item
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });

    if (item) {
      await MenuItem.deleteOne({ _id: req.params.id });
      res.json({ message: 'Menu item removed' });
    } else {
      res.status(404).json({ message: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
