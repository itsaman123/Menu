const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const { protect, requireFeature } = require('../middleware/authMiddleware');

// Shapes a populated recipe into its response form, adding computed cost fields.
// NOTE: ingredient quantities are assumed to already be in the ingredient's own unit
// (no unit conversion is performed).
function withCosting(recipeDoc) {
  const recipe = recipeDoc.toObject();
  recipe.ingredients = recipe.ingredients.map(line => {
    const ingredient = line.ingredientId;
    const unitCost = ingredient?.unitCost ?? 0;
    const cost = +(line.quantity * unitCost).toFixed(2);
    return {
      ingredientId: ingredient?._id ?? line.ingredientId,
      name: ingredient?.name ?? 'Unknown ingredient',
      unit: ingredient?.unit ?? '',
      quantity: line.quantity,
      unitCost,
      cost,
    };
  });

  const totalCost = +recipe.ingredients.reduce((sum, i) => sum + i.cost, 0).toFixed(2);
  recipe.totalCost = totalCost;
  recipe.foodCostPercentage = recipe.sellingPrice > 0
    ? +((totalCost / recipe.sellingPrice) * 100).toFixed(1)
    : null;

  return recipe;
}

async function buildIngredientLines(restaurantId, rawIngredients) {
  if (!Array.isArray(rawIngredients) || rawIngredients.length === 0) {
    return { error: 'ingredients array is required and must not be empty' };
  }

  const ids = rawIngredients.map(i => i.ingredientId);
  const found = await Ingredient.find({ _id: { $in: ids }, restaurantId });
  const foundSet = new Set(found.map(i => i._id.toString()));

  const lines = [];
  for (const raw of rawIngredients) {
    if (!foundSet.has(String(raw.ingredientId))) {
      return { error: `Ingredient ${raw.ingredientId} not found` };
    }
    const quantity = Number(raw.quantity);
    if (!quantity || quantity <= 0) return { error: 'Each ingredient needs a positive quantity' };
    lines.push({ ingredientId: raw.ingredientId, quantity });
  }

  return { lines };
}

// @route   GET /api/inventory/recipes
// @access  Private
router.get('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const recipes = await Recipe.find({ restaurantId: req.admin.restaurantId })
      .populate('ingredients.ingredientId', 'name unit unitCost')
      .sort('name');
    res.json(recipes.map(withCosting));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/recipes/:id
// @access  Private
router.get('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId })
      .populate('ingredients.ingredientId', 'name unit unitCost');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(withCosting(recipe));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/recipes
// @body    { name, menuItemId?, yieldPortions?, prepTimeMinutes?, sellingPrice, ingredients: [{ ingredientId, quantity }] }
// @access  Private
router.post('/', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const { name, menuItemId, yieldPortions, prepTimeMinutes, sellingPrice, ingredients: rawIngredients } = req.body;
    if (!name || sellingPrice === undefined) {
      return res.status(400).json({ message: 'name and sellingPrice are required' });
    }

    const { lines, error } = await buildIngredientLines(req.admin.restaurantId, rawIngredients);
    if (error) return res.status(400).json({ message: error });

    const recipe = await Recipe.create({
      restaurantId: req.admin.restaurantId,
      name,
      menuItemId: menuItemId || undefined,
      yieldPortions: yieldPortions !== undefined ? Number(yieldPortions) : 1,
      prepTimeMinutes: prepTimeMinutes !== undefined ? Number(prepTimeMinutes) : 0,
      sellingPrice: Number(sellingPrice),
      ingredients: lines,
    });

    const populated = await recipe.populate('ingredients.ingredientId', 'name unit unitCost');
    res.status(201).json(withCosting(populated));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/recipes/:id
// @access  Private
router.put('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const { name, menuItemId, yieldPortions, prepTimeMinutes, sellingPrice, ingredients: rawIngredients } = req.body;

    if (rawIngredients !== undefined) {
      const { lines, error } = await buildIngredientLines(req.admin.restaurantId, rawIngredients);
      if (error) return res.status(400).json({ message: error });
      recipe.ingredients = lines;
    }
    if (name !== undefined) recipe.name = name;
    if (menuItemId !== undefined) recipe.menuItemId = menuItemId;
    if (yieldPortions !== undefined) recipe.yieldPortions = Number(yieldPortions);
    if (prepTimeMinutes !== undefined) recipe.prepTimeMinutes = Number(prepTimeMinutes);
    if (sellingPrice !== undefined) recipe.sellingPrice = Number(sellingPrice);

    await recipe.save();
    const populated = await recipe.populate('ingredients.ingredientId', 'name unit unitCost');
    res.json(withCosting(populated));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/recipes/:id
// @access  Private
router.delete('/:id', protect, requireFeature('inventory'), async (req, res) => {
  try {
    const deleted = await Recipe.findOneAndDelete({ _id: req.params.id, restaurantId: req.admin.restaurantId });
    if (!deleted) return res.status(404).json({ message: 'Recipe not found' });
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
