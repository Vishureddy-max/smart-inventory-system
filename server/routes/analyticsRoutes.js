const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

router.get('/predictions', async (req, res) => {
  try {
    const products = await Product.find();
    
    // Get orders from the last 30 days for velocity calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } });

    // 1. Calculate Sales Velocity (Units sold per day)
    const productSales = {};
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += (item.quantity * item.price);
      });
    });

    const insights = products.map(product => {
      const salesData = productSales[product._id.toString()] || { quantity: 0, revenue: 0 };
      
      // Calculate daily velocity (assuming 30 days)
      const dailyVelocity = salesData.quantity / 30; 
      
      // Predict days until stockout (Infinity if it doesn't sell)
      const daysUntilStockout = dailyVelocity > 0 ? Math.round(product.stock / dailyVelocity) : '999+';

      // DECISION ENGINE LOGIC
      let recommendation = 'Monitor';
      let action = 'No immediate action';
      let statusColor = 'gray';

      if (salesData.quantity === 0 && product.stock > 0) {
        recommendation = 'Drop / Liquidate';
        action = 'Clearance sale. Tying up capital.';
        statusColor = 'red';
      } else if (daysUntilStockout !== '999+' && daysUntilStockout <= 7) {
        recommendation = 'Restock Urgently';
        action = 'High velocity. Reorder immediately!';
        statusColor = 'orange';
      } else if (salesData.revenue > 10000) { // Arbitrary high revenue threshold
        recommendation = 'Cash Cow (Keep)';
        action = 'Top performer. Ensure constant stock.';
        statusColor = 'green';
      }

      return {
        id: product._id,
        name: product.name,
        category: product.category,
        currentStock: product.stock,
        unitsSold30d: salesData.quantity,
        revenue30d: salesData.revenue,
        daysUntilStockout,
        recommendation,
        action,
        statusColor
      };
    });

    // Sort by items that need the most urgent attention
    insights.sort((a, b) => {
      if (a.recommendation === 'Restock Urgently') return -1;
      if (b.recommendation === 'Restock Urgently') return 1;
      return b.revenue30d - a.revenue30d;
    });

    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;