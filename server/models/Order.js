const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  gstPercent: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMode: { type: String, default: 'Cash' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);