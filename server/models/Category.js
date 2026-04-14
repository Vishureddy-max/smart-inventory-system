const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: 'blue' }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);