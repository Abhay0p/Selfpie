import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Store, ChevronRight } from 'lucide-react';

const ShopDiscovery = ({ onSelectShop }) => {
  const [shops, setShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        // Make sure your .env has VITE_API_URL=http://localhost:5000
        const url = `${import.meta.env.VITE_API_URL}/api/shops`;
        const res = await axios.get(url);
        setShops(res.data);
      } catch (err) {
        console.error("Connection Error: Is the backend running?", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const filteredShops = shops.filter(shop => 
    shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Loading Local Stores...</p>
    </div>
  );

  return (
    <div className="w-full px-6">
      <div className="flex items-center gap-2 mb-8">
        <MapPin size={18} className="text-blue-600" />
        <h2 className="text-xl font-black uppercase tracking-tighter">Nearby Stores</h2>
      </div>

      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for grocers, pharmacies..."
          className="w-full bg-zinc-100 p-4 pl-12 rounded-[20px] text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && filteredShops.length === 0 ? (
        <div className="text-center py-20 text-zinc-400 font-bold uppercase text-xs tracking-widest">
          No shops found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <div 
              key={shop._id}
              onClick={() => onSelectShop(shop)}
              className="bg-white border border-zinc-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between mb-4">
                <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-blue-600 transition-colors">
                  <Store size={22} className="text-zinc-500 group-hover:text-white" />
                </div>
                <span className="bg-green-100 text-green-600 text-[10px] font-black px-3 py-1 rounded-full">OPEN</span>
              </div>
              <h3 className="text-lg font-black text-zinc-800">{shop.shopName}</h3>
              <p className="text-[10px] text-zinc-400 font-black uppercase mt-1">{shop.category}</p>
              <div className="mt-6 pt-4 border-t border-zinc-50 flex justify-between items-center text-blue-600 font-black text-xs italic">
                VIEW STOREFRONT <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDiscovery;