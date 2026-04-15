import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Store, ChevronRight, Loader2, Sparkles, LogOut, ScanLine, ShoppingCart, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Abhay_SmartScanner from './Abhay_SmartScanner';
import Abhay_CustomerPickup from './Abhay_CustomerPickup';
import Kulish_StoreCheckIn from './Kulish_StoreCheckIn';
import Kulish_BarcodeScanner from './Kulish_BarcodeScanner';
import Kulish_ManualItemSelection from './Kulish_ManualItemSelection';
import { useCartStore } from '../store/SpAbhay_useCartStore';
import { API_BASE_URL } from '../config';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { Link } from 'react-router-dom';

//auth
function CustomerAuthView({ auth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await auth.login(email, password, isLogin);
  };

  if (localStorage.getItem('merchantToken')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6 mt-[-3rem]">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">You are currently a Merchant</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Please log out of the Merchant dashboard before attempting to access the Shopping interface to prevent data overlap.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/merchant" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition">Return to Dashboard</Link>
          <button onClick={() => { localStorage.removeItem('merchantToken'); localStorage.removeItem('merchantShopId'); window.location.reload(); }} className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition">Force Logout Merchant</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center relative p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-dark p-6 sm:p-10 rounded-[2.5rem] w-full max-w-md relative z-10 m-auto"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white mx-auto">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-slate-50 text-center mb-2">{isLogin ? 'Customer Login' : 'Join SelfpieBlink'}</h2>
        <p className="text-center text-slate-400 text-sm mb-6">Skip the billing queue seamlessly.</p>

        {auth.error && <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="bg-rose-900/30 text-rose-400 text-sm p-3 rounded-lg mb-4 font-bold text-center border border-rose-500/30">{auth.error}</motion.div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-5 py-4 bg-slate-900/60 focus:bg-slate-800 rounded-2xl font-medium border border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-100 placeholder-slate-500" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-5 py-4 bg-slate-900/60 focus:bg-slate-800 rounded-2xl font-medium border border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-100 placeholder-slate-500" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={auth.isLoading} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 mt-2">
            {auth.isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isLogin ? 'Login to App' : 'Create Account')}
          </motion.button>
          <div className="text-center text-sm font-bold text-indigo-400 cursor-pointer pt-2 hover:text-indigo-300 transition-colors" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create a new account' : 'Already have an account?'}
          </div>
          <Link to="/merchant" className="mt-8 flex items-center justify-center gap-2 p-4 bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl text-indigo-300 font-black transition-all border border-slate-700/50 cursor-pointer">
            <Store className="w-5 h-5"/> Switch to Shopkeeper Mode
          </Link>
        </form>
      </motion.div>
    </div>
  );
}

// -- NEARBY SHOPS DISCOVERY --
function NearbyShops({ onSelectShop }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // list or qr

  useEffect(() => {
    const fetchShops = (url) => {
      fetch(url).then(res => res.json()).then(data => { if (data.success) setShops(data.data); }).finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchShops(`${API_BASE_URL}/api/shops/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`),
        () => fetchShops(`${API_BASE_URL}/api/shops/nearby`)
      );
    } else {
      fetchShops(`${API_BASE_URL}/api/shops/nearby`);
    }
  }, []);

  if (mode === 'qr') {
    return (
      <div className="flex flex-col items-start gap-4 w-full">
        <button onClick={() => setMode('list')} className="text-indigo-600 font-bold hover:text-indigo-800 transition flex items-center mt-2 ml-4">
          <ChevronRight className="w-5 h-5 rotate-180 mr-1" /> Back to List
        </button>
        <div className="w-full">
          <Kulish_StoreCheckIn onLockedIn={onSelectShop} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-100">Nearby Stores</h2>
          <p className="text-indigo-300 font-medium tracking-wide">Auto-detected via Geolocation</p>
        </div>
        <button onClick={() => setMode('qr')} className="bg-slate-800/80 text-indigo-400 px-4 py-2 font-bold rounded-xl flex items-center hover:bg-slate-700 transition border border-slate-700 shadow-sm">
          <Camera className="w-4 h-4 mr-2" /> Scan QR
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid gap-4"
        >
          {shops.map((shop, idx) => (
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={shop._id} onClick={() => onSelectShop(shop._id)} className="glass-dark p-6 rounded-3xl cursor-pointer flex justify-between items-center group transition-colors hover:bg-slate-800/80"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-100">{shop.shopName}</h3>
                <p className="text-emerald-400 text-sm font-bold flex items-center mt-1"><MapPin className="w-3.5 h-3.5 mr-1" /> {shop.distanceKm !== undefined ? (shop.distanceKm < 1 ? `${Math.round(shop.distanceKm * 1000)}m away` : `${shop.distanceKm.toFixed(1)}km away`) : 'Distance unknown'}</p>
              </div>
              <div className="w-12 h-12 bg-slate-800/80 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-400 rounded-full flex items-center justify-center transition-colors shadow-inner border border-slate-700">
                <Store className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
          {shops.length === 0 && <p className="text-center font-bold text-slate-500 mt-10">No nearby shops found.</p>}
        </motion.div>
      )}
    </div>
  );
}


export default function Kulish_CustomerShopIn() {
  const [showScanner, setShowScanner] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showManualItems, setShowManualItems] = useState(false);
  const { currentShopId, setShopId, activeOrderId } = useCartStore();
  const auth = useCustomerAuth();

  if (!auth.isAuthenticated) return <CustomerAuthView auth={auth} />;

  if (!currentShopId) {
    return (
      <>
      <div className="pt-4 px-2">
        <div className="flex justify-between items-center glass-dark p-4 px-6 rounded-[2rem] mb-6 mx-auto">
          <span className="font-black text-indigo-400 tracking-tight text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white"><Sparkles className="w-4 h-4" /></div>
            Selfpie
          </span>
          <button onClick={() => auth.logout()} className="flex items-center text-rose-400 font-bold hover:text-rose-300 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-500/30 px-4 py-2 rounded-xl transition">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
        
        {activeOrderId && (
           <div className="flex justify-center mb-6">
             <button onClick={() => window.dispatchEvent(new Event('open-gate-pass'))} className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2 border border-emerald-400/50 transition-transform active:scale-95">
                <Store className="w-5 h-5" /> Open Active Gate Pass <ChevronRight className="w-4 h-4 ml-1" />
             </button>
           </div>
        )}

        <NearbyShops onSelectShop={(id) => setShopId(id)} />
      </div>
      <Abhay_CustomerPickup />
      </>
    );
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="duration-500">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => { setShopId(null); setShowScanner(false); setShowBarcodeScanner(false); setShowManualItems(false); }}
          className="flex items-center text-slate-300 font-semibold hover:text-white transition glass-dark px-4 py-2 rounded-full border border-slate-700"
        >
          <ChevronRight className="rotate-180 w-5 h-5 mr-1" /> Leave Store
        </button>
        <button onClick={() => { auth.logout(); setShopId(null); }} className="flex items-center text-rose-400 font-bold hover:text-rose-300 transition bg-rose-900/30 px-4 py-2 rounded-full border border-rose-500/30">
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </button>
      </div>

      <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="glass-dark rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden mb-safe">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Store className="w-64 h-64 text-white" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Live Store Checkout</h1>
            <div className="text-emerald-400 font-bold flex items-center gap-2 bg-emerald-900/30 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-emerald-500/30 inline-flex">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Store DB Tracking Locked In
            </div>
          </div>
          
          {activeOrderId && (
             <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} onClick={() => window.dispatchEvent(new Event('open-gate-pass'))} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 border border-emerald-400/50 transition-all w-full md:w-auto justify-center z-20">
                <Store className="w-5 h-5" /> Open Gate Pass <ChevronRight className="w-4 h-4 ml-1" />
             </motion.button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <motion.div whileHover={{y:-5}} className="glass-dark p-6 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-slate-800/60 transition-all h-full relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-2">Instant Scan</h3>
            <p className="text-slate-400 mb-6 text-xs flex-1">Scan an item's barcode from your camera for quick add.</p>
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.95}} onClick={() => setShowBarcodeScanner(true)} className="w-full py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-auto">
              <ScanLine className="w-4 h-4 text-indigo-400" /> Camera Scan
            </motion.button>
          </motion.div>

          <motion.div whileHover={{y:-5}} className="glass-dark p-6 rounded-3xl flex flex-col items-center justify-center text-center group hover:bg-indigo-900/20 transition-all h-full relative overflow-hidden border-indigo-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 z-0"></div>
            <div className="relative z-10 flex flex-col w-full h-full">
               <h3 className="text-xl font-bold text-white mb-2">Magic List</h3>
               <p className="text-indigo-200/70 mb-6 text-xs flex-1">Take a picture of your handwritten shopping list.</p>
               <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.95}} onClick={() => setShowScanner(true)} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 mt-auto">
                 <Sparkles className="w-4 h-4" /> AI Upload
               </motion.button>
            </div>
          </motion.div>

          <motion.div whileHover={{y:-5}} className="glass-dark p-6 rounded-3xl border-amber-500/30 flex flex-col items-center justify-center text-center group hover:bg-amber-900/20 transition-all h-full">
            <h3 className="text-xl font-bold text-white mb-2">Store Catalog</h3>
            <p className="text-slate-400 mb-6 text-xs flex-1">Browse all available grocery items manually.</p>
            <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.95}} onClick={() => setShowManualItems(true)} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 mt-auto">
              <ShoppingCart className="w-4 h-4" /> Browse DB
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {showScanner && <Abhay_SmartScanner onClose={() => setShowScanner(false)} shopId={currentShopId} />}
      {showBarcodeScanner && <Kulish_BarcodeScanner onClose={() => setShowBarcodeScanner(false)} shopId={currentShopId} />}
      {showManualItems && <Kulish_ManualItemSelection onClose={() => setShowManualItems(false)} shopId={currentShopId} />}

      <Abhay_CustomerPickup />
    </motion.div>
  );
}
