const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new order AND deduct stock
router.post('/', async (req, res) => {
  try {
    // 1. Save the new order
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();

    // 2. Loop through the cart and deduct stock for each product
    for (let item of req.body.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity } // $inc with a negative number subtracts it
      });
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;