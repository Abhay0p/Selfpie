const mongoose = require('mongoose');
const Shop = require('./models/Shop'); // Adjust path if needed
const Product = require('./models/product'); // Adjust path if needed
require('dotenv').config(); 

const products = [
  // Dairy & Bread
  { name: "Amul Taaza Milk 1L", price: 66, category: "Dairy", barcode: "8901231779696" },
  { name: "Harvest Gold White Bread", price: 45, category: "Bakery", barcode: "8901063024722" },
  { name: "Amul Butter 100g", price: 58, category: "Dairy", barcode: "8901231761615" },
  
  // Snacks & Munchies
  { name: "Lay's Classic Salted", price: 20, category: "Snacks", barcode: "8901491101833" },
  { name: "Kurkure Masala Munch", price: 20, category: "Snacks", barcode: "8901491503057" },
  { name: "Doritos Cheese Nachos", price: 50, category: "Snacks", barcode: "8901491000655" },
  
  // Instant Food
  { name: "Maggi Masala Noodles 70g", price: 14, category: "Instant", barcode: "8901058000106" },
  { name: "Top Ramen Curry", price: 15, category: "Instant", barcode: "8901058860601" },
  
  // Beverages
  { name: "Coca-Cola 750ml", price: 45, category: "Beverages", barcode: "5449000000996" },
  { name: "Red Bull Energy Drink", price: 125, category: "Beverages", barcode: "9002490100070" },
  { name: "Bisleri Water 1L", price: 20, category: "Beverages", barcode: "8906017290021" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Seeding...");

    // 1. Find your shop (or create one if it doesn't exist)
    // Replace 'YOUR_SHOP_ID_HERE' with your actual Atlas ID
    const shopId = "YOUR_SHOP_ID_HERE"; 

    // 2. Clear existing products to avoid duplicates
    await Product.deleteMany({});
    console.log("Cleared old products.");

    // 3. Attach shopId to each product and save
    const productsWithShop = products.map(p => ({ ...p, shopId }));
    await Product.insertMany(productsWithShop);

    console.log(`Successfully added ${productsWithShop.length} products to Shop ${shopId}!`);
    process.exit();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();