import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, ShoppingBag, Navigation, Loader2, Search } from "lucide-react";

const ShopDiscovery = ({ onSelectShop }) => {
  const [shops, setShops] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Attempt to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchShops(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Location blocked, using demo coordinates...");
          fetchShops(28.4744, 77.4977); // Bennett University Default
        }
      );
    } else {
      fetchShops(28.4744, 77.4977);
    }
  }, []);

  const fetchShops = (lat, lng) => {
    setLoading(true);
    // Note: Using your 'Infinity' logic—backend returns all shops regardless of distance for testing
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/shops/nearby?lat=${lat}&lng=${lng}`;

    axios.get(apiUrl)
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setShops(res.data);
        } else {
          // FALLBACK: Always show Abhay's Supermart if DB is empty
          setShops([{
            _id: "demo123", // Replace this with your actual Atlas ID for syncing products!
            shopName: "Abhay's Supermart (Demo Mode)",
            category: "Grocery & Essentials",
            location: { coordinates: [77.4977, 28.4744] }
          }]);
        }
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setError("Connection failed. Check your backend server.");
        setShops([]); 
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-zinc-900">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
        <p className="text-lg font-black italic text-blue-600">Finding Shops...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2 italic">
          <MapPin className="text-blue-600" /> NEARBY STORES
        </h2>
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <Search size={20} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-2">
          <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse" /> {error}
        </div>
      )}

      <div className="space-y-4">
        {shops.map((shop) => (
          <div 
            key={shop._id}
            onClick={() => onSelectShop(shop)}
            className="group bg-white p-5 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer active:scale-95"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-zinc-100 h-12 w-12 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <ShoppingBag size={24} className="text-zinc-400 group-hover:text-white" />
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Navigation size={10} fill="currentColor" /> Open Now
              </div>
            </div>
            
            <h3 className="text-xl font-black text-zinc-900">{shop.shopName}</h3>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">{shop.category}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
              <span className="text-blue-600 font-bold text-sm">View Storefront</span>
              <div className="h-8 w-8 bg-zinc-900 text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopDiscovery;