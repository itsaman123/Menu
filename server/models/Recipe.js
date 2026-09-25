const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity:     { type: Number, required: true, min: 0 }, // in the referenced ingredient's unit
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  restaurantId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  menuItemId:      { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:            { type: String, required: true, trim: true },
  yieldPortions:   { type: Number, default: 1, min: 1 },
  prepTimeMinutes: { type: Number, default: 0, min: 0 },
  sellingPrice:    { type: Number, required: true, min: 0 },
  ingredients:     [recipeIngredientSchema],
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
