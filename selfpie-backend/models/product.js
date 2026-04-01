const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  name: String,
  price: Number,
  stock: Number,
  category: String,
  barcode: String
});

module.exports = mongoose.model('Product', ProductSchema);