import { useState, useEffect } from 'react';
import axios from 'axios';
import ShopDiscovery from './components/ShopDiscovery';
import FlashPickup from './components/tesseract'; 
import SelfCheckout from './components/SelfCheckout'; 
import CheckoutSummary from './components/CheckoutSummary';
import HandoverScanner from './components/HandoverScanner';
import NotificationBar from './components/NotificationBar'; // The silent slider
import { ShoppingBag, ScanLine, ShoppingCart, ArrowLeft, CheckCircle2 } from 'lucide-react';

function App() {
  // Navigation & Shop State
  const [selectedShop, setSelectedShop] = useState(null);
  const [mode, setMode] = useState('flash'); 
  
  // Cart & Order State
  const [cart, setCart] = useState([]); 
  const [showSummary, setShowSummary] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null); // Pending, Preparing, Ready, Completed
  const [showHandoverScanner, setShowHandoverScanner] = useState(false);

  // --- 1. Silent Status Poller (The Zomato/Blinkit feel) ---
  useEffect(() => {
    let interval;
    if (activeOrderId && orderStatus !== 'Completed') {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${activeOrderId}`);
          if (res.data.status !== orderStatus) {
            setOrderStatus(res.data.status); // Triggers NotificationBar
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000); // Polls every 5 seconds
    }
    return () => clearInterval(interval);
  }, [activeOrderId, orderStatus]);

  // --- 2. Cart Logic ---
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  // --- 3. Handover Completion ---
  const handleHandoverSuccess = async (qrData) => {
    // qrData contains the shopkeeper's verification string
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/orders/${activeOrderId}`, { status: 'Completed' });
      setOrderStatus('Completed');
      setShowHandoverScanner(false);
      alert("Order Received Successfully! Happy Shopping.");
      // Reset for next order
      setCart([]);
      setActiveOrderId(null);
      setSelectedShop(null);
    } catch (err) {
      alert("Verification Failed. Try scanning again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-32 text-zinc-900">
      
      {/* 🔔 Silent Notification Bar */}
      <NotificationBar status={orderStatus} />

      {/* Navbar */}
      <div className="bg-white p-4 shadow-sm mb-4 sticky top-0 z-20 flex justify-between items-center border-b border-zinc-100">
        <h1 className="text-2xl font-black text-blue-600 italic">SELFPIE</h1>
        
        <div className="flex items-center gap-3">
          {orderStatus === 'Ready' && (
            <div className="flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black animate-bounce">
              READY
            </div>
          )}
          {cart.length > 0 && (
            <button 
              onClick={() => setShowSummary(true)}
              className="relative bg-blue-100 p-2 rounded-full text-blue-600 active:scale-90 transition-all"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cart.reduce((acc, item) => acc + (item.quantity || 1), 0)}
              </span>
            </button>
          )}
        </div>
      </div>

      {!selectedShop ? (
        <ShopDiscovery onSelectShop={setSelectedShop} />
      ) : (
        <div className="max-w-md mx-auto">
          {/* Header & Back Button */}
          <div className="px-4 flex items-center gap-3 mb-2">
            <button 
              onClick={() => { setSelectedShop(null); setCart([]); }} 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-zinc-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold leading-tight">{selectedShop.shopName}</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{selectedShop.category}</p>
            </div>
          </div>

          {/* Handover Button (Appears only when Ready) */}
          {orderStatus === 'Ready' && (
            <div className="px-4 mb-4">
              <button 
                onClick={() => setShowHandoverScanner(true)}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl border-b-4 border-blue-500 active:scale-95 transition-all"
              >
                <ScanLine size={20} className="text-blue-400" /> 
                RECEIVE ORDER (SCAN QR)
              </button>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="px-4 mb-6">
            <div className="flex bg-zinc-200 p-1 rounded-2xl mt-4 border border-zinc-200">
              <button 
                onClick={() => setMode('flash')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === 'flash' ? 'bg-white shadow-md text-blue-600' : 'text-zinc-500'
                }`}
              >
                <ShoppingBag size={18} /> Flash Pickup
              </button>
              <button 
                onClick={() => setMode('scan')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === 'scan' ? 'bg-white shadow-md text-blue-600' : 'text-zinc-500'
                }`}
              >
                <ScanLine size={18} /> Browse Items
              </button>
            </div>
          </div>

          <div className="px-4">
            {mode === 'flash' ? (
              <FlashPickup selectedShopId={selectedShop._id} onAddToCart={addToCart} />
            ) : (
              <SelfCheckout selectedShopId={selectedShop._id} onAddToCart={addToCart} />
            )}
          </div>
        </div>
      )}

      {/* Floating Checkout Button */}
      {cart.length > 0 && selectedShop && !showSummary && orderStatus !== 'Preparing' && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-30">
          <button 
            onClick={() => setShowSummary(true)}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-2xl shadow-blue-200 active:scale-95 transition-transform flex justify-between px-8"
          >
            <span className="flex items-center gap-2 uppercase tracking-tighter italic">View Cart ({cart.length})</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      )}

      {/* --- Overlays --- */}
      {showSummary && (
        <CheckoutSummary 
          cart={cart} 
          shop={selectedShop} 
          onOrderPlaced={(id) => {
            setActiveOrderId(id);
            setOrderStatus('Pending');
          }}
          onClose={() => setShowSummary(false)} 
          onClearCart={() => setCart([])}
        />
      )}

      {showHandoverScanner && (
        <HandoverScanner 
          onScanSuccess={handleHandoverSuccess}
          onClose={() => setShowHandoverScanner(false)}
        />
      )}
    </div>
  );
}

export default App;