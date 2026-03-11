import { useState } from 'react';
import ShopDiscovery from './components/ShopDiscovery';
import FlashPickup from './components/tesseract'; 
import SelfCheckout from './components/SelfCheckout'; 
import { ShoppingBag, ScanLine } from 'lucide-react';

function App() {
  const [selectedShop, setSelectedShop] = useState(null);
  const [mode, setMode] = useState('flash');

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <div className="bg-white p-4 shadow-sm mb-4 sticky top-0 z-10">
        <h1 className="text-2xl font-black text-blue-600 italic text-center">SELFPIE</h1>
      </div>

      {!selectedShop ? (
        <ShopDiscovery onSelectShop={setSelectedShop} />
      ) : (
        <div className="max-w-md mx-auto">
          <button onClick={() => setSelectedShop(null)} className="ml-4 text-sm text-blue-600 font-bold mb-4">
            ← Back to Shops
          </button>
          
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold">{selectedShop.shopName}</h2>
            <div className="flex bg-gray-200 p-1 rounded-xl mt-4">
              <button 
                onClick={() => setMode('flash')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'flash' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <ShoppingBag size={16} /> Flash Pickup
              </button>
              <button 
                onClick={() => setMode('scan')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'scan' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <ScanLine size={16} /> In-Store Scan
              </button>
            </div>
          </div>

          {mode === 'flash' ? (
            <FlashPickup selectedShopId={selectedShop._id} />
          ) : (
            <SelfCheckout selectedShopId={selectedShop._id} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;