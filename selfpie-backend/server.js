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
  barcode: String
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
  totalAmount: Number,
  status: { type: String, default: 'pending' }, 
  isSelfCheckout: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));

// --- Routes ---

// 1. Discovery (500km radius for stable testing)
app.get('/api/shops/nearby', async (req, res) => {
  try {
    // This finds EVERY shop in your database, regardless of location
    const shops = await Shop.find({}); 
    res.json(shops);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Flash Pickup OCR Search
app.post('/api/flash-pickup/search', async (req, res) => {
  const { shopId, items } = req.body; 
  try {
    const foundProducts = await Product.find({
      shopId: shopId,
      name: { $in: items.map(i => new RegExp(i, 'i')) } 
    });
    res.json(foundProducts);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// 3. Barcode Scanner Route
app.get('/api/products/scan/:barcode', async (req, res) => {
  const { shopId } = req.query;
  try {
    const product = await Product.findOne({ 
      barcode: req.params.barcode, 
      shopId: shopId 
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found in this shop" });
    }
  } catch (err) {
    res.status(500).json({ error: "Scanner lookup failed" });
  }
});

// 4. Create Order (For both Flash Pickup & Self-Checkout)
app.post('/api/orders/create', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ success: true, orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));