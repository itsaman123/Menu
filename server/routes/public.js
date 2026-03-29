const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// @route   GET /public/menu/:slug
// @desc    Get full structured menu for a restaurant
// @access  Public
router.get('/menu/:slug', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.subscriptionStatus === 'inactive') {
      return res.status(403).json({ message: 'Menu is currently unavailable' });
    }

    const categories = await Category.find({ restaurantId: restaurant._id }).sort('order');
    const menuItems = await MenuItem.find({ restaurantId: restaurant._id, isAvailable: true });

    // Restructure into a single object
    const structuredMenu = categories.map(category => {
      const items = menuItems.filter(item => item.categoryId.toString() === category._id.toString());
      return {
        _id: category._id,
        name: category.name,
        items
      };
    });

    res.json({
      restaurant: {
        name: restaurant.name,
        slug: restaurant.slug
      },
      menu: structuredMenu
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
