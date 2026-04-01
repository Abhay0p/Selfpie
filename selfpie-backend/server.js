const express = require('express');
const http = require('http'); // New: Required for Socket.io
const { Server } = require('socket.io'); // New: Socket.io
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const server = http.createServer(app); // Wrap express in HTTP server
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ Connection Error:", err.message));

// --- 2. MODELS (Enhanced with Geolocation) ---
const Shop = mongoose.models.Shop || mongoose.model('Shop', new mongoose.Schema({
  shopName: String,
  category: String,
  location: {
    lat: Number,
    lng: Number
  },
  isOpen: { type: Boolean, default: true }
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  name: String,
  price: Number,
  stock: Number,
  category: String,
  barcode: String
}));

const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  items: Array,
  total: Number,
  status: { type: String, default: 'Pending' }, // Pending -> Accepted -> Ready -> Completed
  createdAt: { type: Date, default: Date.now }
}));

// --- 3. REAL-TIME SOCKET LOGIC ---
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);
  
  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    console.log(`👤 User joined room: ${orderId}`);
  });
});

// --- 4. ROUTES ---

// Get all shops (Optionally filter by location later)
app.get('/api/shops', async (req, res) => {
  try {
    const shops = await Shop.find({});
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

// Search products by name or barcode
app.get('/api/products/search', async (req, res) => {
  const { shopId, query, barcode } = req.query;
  try {
    let filter = { shopId };
    if (barcode) filter.barcode = barcode;
    else if (query) filter.name = { $regex: query, $options: 'i' };
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    
    // Notify Merchant of a new order
    io.emit('new_order_alert', newOrder);
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Order failed" });
  }
});

// Update Order Status (Merchant Flow)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // 🔥 LIVE UPDATE: Send status update to the specific customer
    io.to(req.params.id).emit('status_updated', updatedOrder);
    
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
});

app.get('/', (req, res) => res.send("SelfPie Industry Backend Live! 🚀"));

// At the bottom of server.js
const PORT = process.env.PORT || 5000; // Changed from 5000 to 5001
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));