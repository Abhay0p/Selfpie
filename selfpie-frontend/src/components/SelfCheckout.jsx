import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import axios from 'axios';
import { ShoppingCart, Package, CheckCircle } from 'lucide-react';

const SelfCheckout = ({ selectedShopId }) => {
  const [cart, setCart] = useState([]);
  const [scanning, setScanning] = useState(true);

  const handleScan = async (err, result) => {
    if (result) {
      setScanning(false);
      try {
        // Look up the product by barcode in the current shop
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/scan/${result.text}?shopId=${selectedShopId}`
        );
        
        if (res.data) {
          setCart((prev) => [...prev, res.data]);
          alert(`Added ${res.data.name} to cart!`);
        }
      } catch (error) {
        alert("Product not found in this shop's inventory.");
      }
      // Re-enable scanning after a short delay
      setTimeout(() => setScanning(true), 2000);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ShoppingCart className="text-blue-600" /> In-Store Scan
      </h2>

      {scanning && (
        <div className="rounded-2xl overflow-hidden border-4 border-blue-100 mb-6">
          <BarcodeScannerComponent
            width="100%"
            height={250}
            onUpdate={handleScan}
          />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Your Cart</h3>
        {cart.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <Package size={18} className="text-gray-400" />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-blue-600">₹{item.price}</span>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <button className="w-full mt-8 bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <CheckCircle size={20} /> Pay ₹{cart.reduce((acc, curr) => acc + curr.price, 0)}
        </button>
      )}
    </div>
  );
};

export default SelfCheckout;