// backend/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  videoUrl: { type: String, required: true }
});

module.exports = mongoose.model('Item', itemSchema);
