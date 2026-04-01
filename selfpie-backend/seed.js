const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Shop = mongoose.models.Shop || mongoose.model('Shop', new mongoose.Schema({ 
  shopName: String, category: String, location: { lat: Number, lng: Number } 
}));
const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ 
  shopId: mongoose.Schema.Types.ObjectId, name: String, price: Number, stock: Number, barcode: String 
}));

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Shop.deleteMany({});
    await Product.deleteMany({});

    // --- SHOP 1: MART ---
    const mart = await new Shop({ 
      shopName: "Abhay's Campus Mart", category: "Grocery", location: { lat: 28.4744, lng: 77.5040 } 
    }).save();

    // --- SHOP 2: STATIONERY ---
    const penShop = await new Shop({ 
      shopName: "Student Point Stationery", category: "Education", location: { lat: 28.4750, lng: 77.5030 } 
    }).save();

    // --- SHOP 3: BAKERY ---
    const bakery = await new Shop({ 
      shopName: "Fresh Bakes & Coffee", category: "Food & Cafe", location: { lat: 28.4730, lng: 77.5050 } 
    }).save();

    await Product.insertMany([
      // Mart Items
      { shopId: mart._id, name: "Maggi Masala", price: 14, stock: 100, barcode: "12345" },
      { shopId: mart._id, name: "Amul Milk 500ml", price: 33, stock: 50, barcode: "67890" },
      { shopId: mart._id, name: "Coke 750ml", price: 45, stock: 30, barcode: "11223" },
      // Stationery Items
      { shopId: penShop._id, name: "Classmate Notebook", price: 60, stock: 40, barcode: "55555" },
      { shopId: penShop._id, name: "Parker Vector Pen", price: 250, stock: 10, barcode: "66666" },
      { shopId: penShop._id, name: "A4 Paper Rim", price: 350, stock: 25, barcode: "77777" },
      // Bakery Items
      { shopId: bakery._id, name: "Chocolate Muffin", price: 80, stock: 12, barcode: "88888" },
      { shopId: bakery._id, name: "Hot Cappuccino", price: 120, stock: 99, barcode: "99999" },
      { shopId: bakery._id, name: "Paneer Patties", price: 35, stock: 20, barcode: "00000" }
    ]);

    console.log("✅ 3 Shops & Inventories Seeded Successfully!");
  } catch (err) { console.error(err); }
  finally { mongoose.connection.close(); process.exit(); }
};
seed();