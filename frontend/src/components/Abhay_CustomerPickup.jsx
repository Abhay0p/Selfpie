import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/SpAbhay_useCartStore';
import { ShoppingBag, X, Plus, Minus, CreditCard, ChevronUp, QrCode, Clock, CheckCircle2, PackageCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

export default function Abhay_CustomerPickup() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, currentShopId, activeOrderId, setActiveOrderId } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [showGatePass, setShowGatePass] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [isLoadingOrder, setIsLoadingOrder] = useState(!!activeOrderId);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const fetchActiveOrder = () => {
    const freshOrderId = useCartStore.getState().activeOrderId;
    if(!freshOrderId) return;
    
    setIsLoadingOrder(true);
    fetch(`${API_BASE_URL}/api/orders/active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIdString: freshOrderId })
    }).then(res => res.json()).then(data => {
      if(data.success) {
         setActiveOrder({ id: data.data.orderIdString, status: data.data.status, prepTime: data.data.estPrepTime, upiLink: '', items: data.data.items || [], shopName: data.data.shopName, razorpayOrderId: data.data.razorpayOrderId });
      } else {
         useCartStore.getState().setActiveOrderId(null);
      }
    }).finally(() => setIsLoadingOrder(false));
  };

  useEffect(() => {
    if (activeOrderId && !activeOrder) fetchActiveOrder();
  }, [activeOrderId, currentShopId]);

  useEffect(() => {
    const handleOpenGatePass = () => {
      setShowGatePass(true);
      fetchActiveOrder();
    };
    window.addEventListener('open-gate-pass', handleOpenGatePass);
    return () => window.removeEventListener('open-gate-pass', handleOpenGatePass);
  }, []);

  useEffect(() => {
    if(!activeOrder) return;
    const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
    socket.emit('track_order', activeOrder.id);
    
    socket.on('order_status_changed', (data) => {
       if (data.orderId === activeOrder.id) {
         if (data.status === 'Completed') {
            setActiveOrderId(null);
            setActiveOrder(null);
         } else {
            setActiveOrder(prev => ({ ...prev, status: data.status }));
         }
       }
    });
    return () => socket.disconnect();
  }, [activeOrder?.id]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: currentShopId, items: cartItems, total: totalPrice, pickupTime: pickupTime || 'As soon as possible' })
      });
      const data = await res.json();
      
      if(data.success) {
        setActiveOrder({ id: data.orderId, status: 'Pending Payment', items: cartItems, razorpayOrderId: data.razorpayOrderId });
        setActiveOrderId(data.orderId);
        setShowGatePass(true);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const verifyPaymentLocally = async () => {
     try {
       await fetch(`${API_BASE_URL}/api/orders/verify-payment`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ orderIdString: activeOrder.id, shopId: currentShopId })
       });
     } catch (err) {
       console.error('Verify Payment API call failed:', err);
     }
     setActiveOrder({ ...activeOrder, status: 'Pending' });
     clearCart();
     const socket = io(API_BASE_URL, { transports: ['websocket'] });
     socket.emit('new_order', { orderId: activeOrder.id, shopId: currentShopId, total: totalPrice, items: cartItems });
     fetchActiveOrder();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => { resolve(true); };
      script.onerror = () => { resolve(false); };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsCheckingOut(true);
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsCheckingOut(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: Math.round(totalPrice * 100), // Amount in paise
      currency: "INR",
      order_id: activeOrder.razorpayOrderId,
      name: "SelfpieBlink Checkout",
      description: "Grocery Payment",
      handler: function (response) {
         // Success handler
         verifyPaymentLocally();
      },
      prefill: {
        name: "Test Customer",
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: { color: "#4f46e5" },
    };
    
    setIsCheckingOut(false);
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const getStatusIcon = (status) => {
    if(status === 'Pending') return <Clock className="w-12 h-12 text-blue-500 animate-pulse" />;
    if(status === 'Accepted') return <CheckCircle2 className="w-12 h-12 text-indigo-500" />;
    if(status === 'Ready for Pickup') return <PackageCheck className="w-12 h-12 text-emerald-500" />;
    return <ShoppingBag className="w-12 h-12 text-amber-500" />;
  };

  if (activeOrder && showGatePass) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 transition-colors"
          onClick={() => setShowGatePass(false)}
        />
        <motion.div 
          initial={{ y: "100%", opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6 pb-safety flex justify-center pointer-events-none"
        >
          <div className="glass-dark w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col items-center p-8 text-center relative max-h-[90vh] overflow-y-auto pointer-events-auto">
            <button onClick={() => setShowGatePass(false)} className="absolute top-4 right-4 p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white transition shadow-sm"><X className="w-5 h-5" /></button>

          {activeOrder.status === 'Pending Payment' ? (
            <>
              <h3 className="text-2xl font-black text-white mb-2 mt-4">Complete Payment</h3>
              <p className="text-slate-400 font-medium mb-6">Proceed with secure Razorpay Checkout.</p>
              
              <div className="bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 p-6 rounded-3xl font-black text-xl mb-6 text-center w-full">
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-2">Amount to Pay</p>
                <div className="text-4xl text-indigo-300">₹{totalPrice}</div>
              </div>
              
              <div className="space-y-4 w-full mt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRazorpayPayment} 
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-[1.5rem] font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                  {isCheckingOut ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading Checkout...</> : 'Pay with Checkout'}
                </motion.button>
              </div>
            </>
          ) : ['Pending', 'Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? (
             <>
               <div className="w-full bg-gradient-to-b from-emerald-900/40 to-slate-900/80 pt-6 pb-2 rounded-2xl border-2 border-emerald-500/30 shadow-sm relative overflow-hidden backdrop-blur-md">
                 <h2 className="text-xl font-black text-emerald-400 mx-6 border-b border-emerald-500/30 pb-2 border-dashed">GATE PASS READY</h2>
                 {activeOrder.shopName && (
                    <div className="mt-4 px-6 mb-2">
                       <p className="font-bold text-white text-lg uppercase tracking-tight truncate border-b border-slate-700/50 pb-2">{activeOrder.shopName}</p>
                    </div>
                 )}
                 <div className="bg-white p-2 rounded-xl mx-auto my-6 w-fit h-fit"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeOrder.id}&color=047857`} alt="QR" className="" /></div>
                 <p className="font-mono text-emerald-300 font-bold bg-emerald-900/50 border border-emerald-500/30 inline-block px-4 py-1.5 rounded-lg tracking-widest">{activeOrder.id}</p>
                 <p className="text-xs text-emerald-400 font-bold mt-4 px-6 opacity-70">Status: {activeOrder.status}</p>
                 <p className="text-xs text-slate-400 mt-2 px-6">Show prominently at gate exits to walk out.</p>
                 {activeOrder.items && activeOrder.items.length > 0 && (
                   <div className="mt-4 px-6 pb-4 text-left max-h-32 overflow-y-auto w-full mx-auto">
                     <p className="text-xs font-bold text-slate-500 uppercase mb-2 border-b border-emerald-500/20 pb-1">Items Bought</p>
                     <ul className="text-sm font-medium text-slate-300 space-y-1">
                       {activeOrder.items.map((item, idx) => (
                         <li key={idx} className="flex justify-between items-center bg-emerald-900/30 px-3 py-1 rounded-lg">
                           <span className="truncate mr-2 flex-1">{item.name}</span>
                           <span className="font-bold shrink-0 text-emerald-400">x{item.quantity}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
             </>
          ) : (
            <>
              <div className="w-20 h-20 bg-indigo-900/30 border border-indigo-500/30 rounded-full flex items-center justify-center mb-6 shadow-shape relative">
                 <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin opacity-40"></div>
                 {getStatusIcon(activeOrder.status)}
              </div>
              <h3 className="text-2xl font-black text-white mb-2">
                 {activeOrder.status === 'Pending' ? `Expected around ${activeOrder.prepTime || 15} mins` : activeOrder.status === 'Ready for Pickup' ? 'Packed in the customer outlet' : 'Order Preparing'}
              </h3>
              
              <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mt-6 relative overflow-hidden backdrop-blur-sm">
                 <div className="flex justify-between items-center relative z-10 w-full px-2">
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-4 h-4 rounded-full ${['Pending', 'Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`}></div>
                       <span className={`text-[10px] font-bold ${['Pending', 'Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'text-indigo-400' : 'text-slate-500'}`}>Placed</span>
                    </div>
                    
                    <div className={`flex-1 h-1 mx-2 rounded-full ${['Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-4 h-4 rounded-full ${['Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`}></div>
                       <span className={`text-[10px] font-bold ${['Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'text-indigo-400' : 'text-slate-500'}`}>Preparing</span>
                    </div>
                    
                    <div className={`flex-1 h-1 mx-2 rounded-full ${activeOrder.status === 'Ready for Pickup' ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-4 h-4 rounded-full ${activeOrder.status === 'Ready for Pickup' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`}></div>
                       <span className={`text-[10px] font-bold ${activeOrder.status === 'Ready for Pickup' ? 'text-indigo-400' : 'text-slate-500'}`}>Packed</span>
                    </div>
                 </div>
              </div>
              <p className="font-bold text-slate-400 mt-6 tracking-wide uppercase text-xs">{activeOrder.status}</p>
            </>
          )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 transition-opacity ${!isOpen && 'pointer-events-none'}`} 
        onClick={() => setIsOpen(false)}
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? 0 : "calc(100% - 80px)" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col items-center pointer-events-none`}
      >
        <div className="glass-dark w-full max-w-md rounded-t-[2.5rem] overflow-hidden shadow-[0_-10px_50px_-5px_rgba(0,0,0,0.5)] pointer-events-auto border-t border-slate-700/50">
          <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-5 px-6 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 backdrop-blur-md text-white cursor-pointer transition-colors shadow-inner border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-xs font-bold leading-none">{totalItems}</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">View active cart</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-black text-xl">₹{totalPrice}</div>
              <ChevronUp className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto bg-slate-900/50 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-white">Your Items</h3>
              <button onClick={clearCart} className="text-xs font-bold text-rose-400 bg-rose-900/40 border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-900/60 transition">Clear Cart</button>
            </div>
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/60 rounded-2xl border border-slate-700 shadow-inner">
                  <div className="flex-1 shrink-0 px-2 truncate">
                    <p className="font-bold text-slate-100 text-sm truncate">{item.name}</p>
                    <p className="text-emerald-400 font-medium text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/80 px-2 py-1.5 rounded-xl border border-slate-700/50 shrink-0">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-4 text-center font-bold text-sm text-slate-100">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-800/60 rounded-lg">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 bg-slate-800/40 p-4 border border-slate-700/50 rounded-2xl">
              <label className="text-sm font-bold text-slate-300 mb-2 block flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> Expected Pickup Time</label>
              <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 text-slate-100 color-scheme-dark rounded-xl focus:border-indigo-500 outline-none transition-colors" />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout} 
              disabled={isCheckingOut} 
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-[1.5rem] font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 transition-all flex justify-center items-center gap-2">
              {isCheckingOut ? <><Loader2 className="w-5 h-5 animate-spin" /> Preparing...</> : `Checkout • ₹${totalPrice}`}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
