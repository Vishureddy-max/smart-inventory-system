const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, default: 'Uncategorized' }, 
  price: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);