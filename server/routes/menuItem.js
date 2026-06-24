const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const { protect, requireFeature } = require('../middleware/authMiddleware');

// GET /api/menu-items
router.get('/', protect, requireFeature('menu'), async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.admin.restaurantId });
    res.json(items);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/menu-items
router.post('/', protect, requireFeature('menu'), async (req, res) => {
  try {
    const { name, description, price, image, categoryId, isVeg, isAvailable } = req.body;
    const item = await MenuItem.create({
      name, description, price, image, categoryId,
      restaurantId: req.admin.restaurantId,
      isVeg: isVeg !== undefined ? isVeg : true,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/menu-items/bulk
// Body: { items: [{ name, description, price, categoryName, isVeg, isAvailable }] }
// Auto-creates any category that doesn't yet exist.
router.post('/bulk', protect, requireFeature('menu'), async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: 'No items provided' });
  if (items.length > 500)
    return res.status(400).json({ message: 'Maximum 500 items per upload' });

  const restaurantId = req.admin.restaurantId;

  // Collect unique category names from the payload
  const uniqueNames = [...new Set(
    items.map(i => (i.categoryName || '').trim()).filter(Boolean)
  )];

  // Load all existing categories for this restaurant once
  const existingCats = await Category.find({ restaurantId });
  const catMap = new Map(existingCats.map(c => [c.name.toLowerCase(), c._id]));

  // Create missing categories in one shot
  const missing = uniqueNames.filter(n => !catMap.has(n.toLowerCase()));
  if (missing.length) {
    const created = await Category.insertMany(
      missing.map(name => ({ name, restaurantId }))
    );
    created.forEach(c => catMap.set(c.name.toLowerCase(), c._id));
  }

  const toInsert = [];
  const errors = [];

  items.forEach((item, idx) => {
    const row = idx + 2; // row 1 is the CSV header
    const name = item.name?.trim();
    const price = Number(item.price);
    const catId = catMap.get((item.categoryName || '').trim().toLowerCase());

    if (!name) { errors.push({ row, message: 'Name is required' }); return; }
    if (!price || price <= 0) { errors.push({ row, name, message: 'Invalid price' }); return; }
    if (!catId) { errors.push({ row, name, message: 'Category missing' }); return; }

    toInsert.push({
      name,
      description: (item.description || '').trim(),
      price,
      categoryId: catId,
      restaurantId,
      isVeg: String(item.isVeg).toLowerCase() !== 'false',
      isAvailable: String(item.isAvailable).toLowerCase() !== 'false',
    });
  });

  let imported = 0;
  if (toInsert.length) {
    const result = await MenuItem.insertMany(toInsert, { ordered: false });
    imported = result.length;
  }

  res.json({ imported, total: items.length, errors });
});

// PUT /api/menu-items/:id
router.put('/:id', protect, requireFeature('menu'), async (req, res) => {
  try {
    const { name, description, price, image, categoryId, isVeg, isAvailable } = req.body;
    const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (image !== undefined) item.image = image;
    if (categoryId !== undefined) item.categoryId = categoryId;
    if (isVeg !== undefined) item.isVeg = isVeg;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    res.json(await item.save());
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/menu-items/:id
router.delete('/:id', protect, requireFeature('menu'), async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item removed' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
