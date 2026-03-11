const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Shop = mongoose.model('Shop', new mongoose.Schema({
  shopName: String,
  category: String,
  location: { type: { type: String, default: 'Point' }, coordinates: [Number] }
}).index({ location: '2dsphere' }));

const Product = mongoose.model('Product', new mongoose.Schema({
  shopId: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  stock: Number,
  barcode: String
}));

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await Shop.deleteMany({});
    await Product.deleteMany({});

    const shopsToCreate = [
      {
        shopName: "Abhay's Supermart (Pari Chowk)",
        category: "Grocery",
        location: { type: "Point", coordinates: [77.5100, 28.4670] }
      },
      {
        shopName: "Mother Dairy (Alpha 1)",
        category: "Dairy",
        location: { type: "Point", coordinates: [77.5050, 28.4750] }
      },
      {
        shopName: "Quick Pick (Knowledge Park)",
        category: "Convenience",
        location: { type: "Point", coordinates: [77.4850, 28.4600] }
      },
      {
        shopName: "Abhay's Flagship Store",
        category: "Supermarket",
        location: { type: "Point", coordinates: [77.4977, 28.4744] }
      },
      { shopName: "Bennett University", category: "Grocery",
         location: { type: "Point", coordinates: [77.5843, 28.4506] } }

    ];

    const createdShops = await Shop.insertMany(shopsToCreate);
    console.log(`✅ ${createdShops.length} Shops Created!`);

    // 2. Add products to the first shop (Flagship Store)
    const products = [
      { shopId: createdShops[3]._id, name: "Amul Milk 1L", price: 66, stock: 50, barcode: "12345" },
      { shopId: createdShops[3]._id, name: "Mother Dairy Bread", price: 40, stock: 30, barcode: "67890" },
      { shopId: createdShops[3]._id, name: "Lays Blue Chips", price: 20, stock: 100, barcode: "11223" },
      { shopId: createdShops[3]._id, name: "Maggi 2-Min Noodles", price: 14, stock: 200, barcode: "44556" },
      { shopId: createdShops[3]._id, name: "Aashirvaad Atta 5kg", price: 260, stock: 15, barcode: "77889" }
    ];

    await Product.insertMany(products);
    console.log("✅ Products added to Flagship Store!");

    console.log("🚀 Database Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();