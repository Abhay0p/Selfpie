import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBasket, Plus, Clock, Search, Tag, Loader2, Sparkles, X } from 'lucide-react';

const SelfCheckout = ({ selectedShopId, onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Hits your backend search endpoint
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/search?shopId=${selectedShopId}`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedShopId]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 bg-white rounded-[32px] border border-zinc-100 shadow-sm">
        <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
        <p className="text-sm font-black text-zinc-600 uppercase tracking-widest">Syncing Inventory...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] p-5 shadow-sm border border-zinc-100 min-h-[65vh]">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-4 text-zinc-400" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          placeholder="Search items in this shop..." 
          className="w-full pl-12 pr-10 py-4 bg-zinc-100 rounded-2xl text-sm font-semibold outline-none focus:ring-2 ring-blue-500 transition-all placeholder:text-zinc-400"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-4 text-zinc-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Zomato-style Prep Time Banner */}
      <div className="flex items-center justify-between mb-6 bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full shadow-sm">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div>
            <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Est. Pickup</span>
            <span className="text-sm font-black text-blue-900">Ready in ~12 mins</span>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-1 rounded-lg font-black uppercase">
          <Sparkles size={10} /> Fast
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 pb-10">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div 
              key={product._id} 
              className="group bg-white border border-zinc-100 p-3 rounded-[28px] hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              {/* Product Visual */}
              <div className="w-full h-28 bg-zinc-50 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden">
                <ShoppingBasket className="text-zinc-200 group-hover:scale-110 group-hover:text-blue-100 transition-transform duration-500" size={44} />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black text-zinc-500 shadow-sm uppercase tracking-tighter">
                   {product.category || 'Essential'}
                </div>
              </div>

              {/* Product Info */}
              <div className="px-1">
                <h4 className="font-bold text-sm text-zinc-800 line-clamp-2 min-h-[40px] leading-tight mb-2">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-300 line-through block">₹{Math.floor(product.price * 1.2)}</span>
                    <p className="text-blue-600 font-black text-lg">₹{product.price}</p>
                  </div>
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-90 transition-all"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center py-16">
            <ShoppingBasket className="text-zinc-100 mb-4" size={60} />
            <p className="text-zinc-400 font-black text-sm uppercase tracking-widest text-center">No Items Found In This Shop</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfCheckout;