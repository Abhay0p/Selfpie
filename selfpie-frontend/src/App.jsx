import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FlashPickup from './components/FlashPickup';
import MerchantDashboard from './components/MerchantDashboard';
import { ShoppingBag, Store, User } from 'lucide-react';
import { useCart } from './store/useCart';

const App = () => {
  const [view, setView] = useState('customer'); // 'customer' or 'merchant'
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const { cart, getTotal, addItem } = useCart();

  // 1. Load Shops on Start
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shops`);
        setShops(res.data);
      } catch (err) {
        console.error("Error fetching shops", err);
      }
    };
    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* --- TOP NAV --- */}
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-black italic tracking-tighter text-blue-600">SELFPIE.</h1>
        <button 
          onClick={() => setView(view === 'customer' ? 'merchant' : 'customer')}
          className="bg-zinc-100 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
          Switch to {view === 'customer' ? 'Merchant' : 'Customer'}
        </button>
      </nav>

      <main className="pb-32">
        {view === 'merchant' ? (
          <MerchantDashboard shopId={shops[0]?._id} />
        ) : (
          <>
            {!selectedShop ? (
              /* --- SHOP SELECTION SCREEN --- */
              <div className="p-6 space-y-4">
                <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Shops Near You</h2>
                <div className="grid gap-4">
                  {shops.map(shop => (
                    <div 
                      key={shop._id}
                      onClick={() => setSelectedShop(shop)}
                      className="bg-white p-6 rounded-[32px] border-2 border-zinc-100 hover:border-blue-600 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-black text-lg">{shop.shopName}</h3>
                          <p className="text-zinc-400 text-xs font-bold">{shop.category}</p>
                        </div>
                        <Store className="text-zinc-200 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* --- STORE SEARCH & CART SCREEN --- */
              <div className="space-y-4">
                <div className="px-6 pt-6 flex items-center justify-between">
                  <button onClick={() => setSelectedShop(null)} className="text-zinc-400 font-bold text-xs">← Change Shop</button>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{selectedShop.shopName}</span>
                </div>
                
                <FlashPickup 
                  selectedShopId={selectedShop._id} 
                  onAddToCart={(product) => addItem(product)} 
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* --- FLOATING CART DRAWER --- */}
      {cart.length > 0 && view === 'customer' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-900 text-white rounded-[32px] p-6 shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-10">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-500">{cart.length} Items Added</p>
            <p className="text-xl font-black italic">₹{getTotal()}</p>
          </div>
          <button className="bg-blue-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
            VIEW CART <ShoppingBag size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;