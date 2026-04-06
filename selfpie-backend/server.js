const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

if (!mongoURI || !mongoURI.startsWith('mongodb')) {
  console.error("❌ ERROR: Invalid or missing MONGO_URI in .env file.");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Failed:", err.message);
  });

// --- Models ---

const Shop = mongoose.model('Shop', new mongoose.Schema({
  shopName: String,
  category: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  }
}).index({ location: '2dsphere' }));

const Product = mongoose.model('Product', new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  name: String,
  price: Number,
  stock: Number,
  barcode: String,
  category: String
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  customerId: String,
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }
  ],
  totalPrice: Number, // Switched from totalAmount to match frontend CheckoutSummary
  status: { type: String, default: 'Pending' }, // Casing matched for frontend
  isSelfCheckout: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));

// --- Routes ---

// 1. Discovery (Infinity Search)
app.get('/api/shops/nearby', async (req, res) => {
  try {
    const shops = await Shop.find({}); 
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. Product Search (Blinkit & Flash Pickup)
app.get('/api/products/search', async (req, res) => {
  const { shopId, query, barcode } = req.query;
  try {
    let filter = { shopId };
    if (barcode) {
      filter.barcode = barcode;
    } else if (query) {
      filter.name = { $regex: query, $options: 'i' }; 
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
}); 

// 3. Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

// 4. Single Order Lookup (For the Silent Poller in App.jsx)
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. Merchant: Get Shop Orders
app.get('/api/orders/shop/:shopId', async (req, res) => {
  try {
    const orders = await Order.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. Merchant: Update Status (The Trigger for Notifications)
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));