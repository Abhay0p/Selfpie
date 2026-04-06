const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true },
  category: String,
  price: { type: Number, required: true },
  barcode: { type: String, unique: true }, // For In-Store Scanning
  stock: { type: Number, default: 100 }
});

// Add a text index so we can search by name for Flash Pickup
productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);