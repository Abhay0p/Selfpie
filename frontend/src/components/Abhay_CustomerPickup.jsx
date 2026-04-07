import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/SpAbhay_useCartStore';
import { ShoppingBag, X, Plus, Minus, CreditCard, ChevronUp, QrCode, Clock, CheckCircle2, PackageCheck, Loader2 } from 'lucide-react';

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
         setActiveOrder({ id: data.data.orderIdString, status: data.data.status, prepTime: data.data.estPrepTime, upiLink: '', items: data.data.items || [], shopName: data.data.shopName });
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
        setActiveOrder({ id: data.orderId, status: 'Pending Payment', upiLink: data.upiLink, items: cartItems });
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

  const getStatusIcon = (status) => {
    if(status === 'Pending') return <Clock className="w-12 h-12 text-blue-500 animate-pulse" />;
    if(status === 'Accepted') return <CheckCircle2 className="w-12 h-12 text-indigo-500" />;
    if(status === 'Ready for Pickup') return <PackageCheck className="w-12 h-12 text-emerald-500" />;
    return <ShoppingBag className="w-12 h-12 text-amber-500" />;
  };

  if (activeOrder && showGatePass) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6 pb-safety flex justify-center transform transition-transform animate-in slide-in-from-bottom-24">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center p-8 text-center relative max-h-[90vh] overflow-y-auto">
          <button onClick={() => setShowGatePass(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>

          {activeOrder.status === 'Pending Payment' ? (
            <>
              <h3 className="text-2xl font-black text-slate-900 mb-2 mt-4">Complete Payment</h3>
              <p className="text-slate-500 font-medium mb-6">Scan QR to pay and get your Gate Pass.</p>
              
              <div className="bg-slate-50 p-4 border-2 border-slate-200 rounded-3xl mb-6 shadow-inner mx-auto inline-block">
                <img 
                  src={`https://quickchart.io/qr?size=250&text=${encodeURIComponent(activeOrder.upiLink)}`} 
                  alt="UPI QR Code" 
                  className="rounded-2xl w-48 h-48 mix-blend-multiply bg-white"
                  onError={(e) => { e.target.src = "https://quickchart.io/qr?size=250&text=SelfpiePayment"; }}
                />
              </div>
              
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl font-black text-xl mb-6 flex items-center justify-center gap-2 w-full">
                <span>Amount to Pay: </span>
                <span className="text-emerald-900">₹{totalPrice}</span>
              </div>
              
              <div className="space-y-4 w-full">
                <button 
                  onClick={() => {
                     setIsCheckingOut(true);
                     setTimeout(() => {
                        setIsCheckingOut(false);
                        verifyPaymentLocally();
                     }, 2000);
                  }} 
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:bg-indigo-400">
                  {isCheckingOut ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Payment...</> : 'I have scanned & paid'}
                </button>
              </div>
            </>
          ) : ['Pending', 'Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? (
             <>
               <div className="w-full bg-gradient-to-b from-emerald-50 to-white pt-6 pb-2 rounded-2xl border-2 border-emerald-100 shadow-sm relative overflow-hidden">
                 <h2 className="text-xl font-black text-emerald-700 mx-6 border-b border-emerald-100 pb-2 border-dashed">GATE PASS READY</h2>
                 {activeOrder.shopName && (
                    <div className="mt-4 px-6 mb-2">
                       <p className="font-bold text-slate-800 text-lg uppercase tracking-tight truncate border-b border-slate-200 pb-2">{activeOrder.shopName}</p>
                    </div>
                 )}
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeOrder.id}&color=047857`} alt="QR" className="mx-auto my-6 mix-blend-multiply" />
                 <p className="font-mono text-emerald-800 font-bold bg-emerald-100 inline-block px-4 py-1.5 rounded-lg tracking-widest">{activeOrder.id}</p>
                 <p className="text-xs text-emerald-600 font-bold mt-4 px-6 opacity-70">Status: {activeOrder.status}</p>
                 <p className="text-xs text-slate-500 mt-2 px-6">Show prominently at gate exits to walk out.</p>
                 {activeOrder.items && activeOrder.items.length > 0 && (
                   <div className="mt-4 px-6 pb-4 text-left max-h-32 overflow-y-auto w-full mx-auto">
                     <p className="text-xs font-bold text-slate-600 uppercase mb-2 border-b border-emerald-100 pb-1">Items Bought</p>
                     <ul className="text-sm font-medium text-slate-700 space-y-1">
                       {activeOrder.items.map((item, idx) => (
                         <li key={idx} className="flex justify-between items-center bg-emerald-50/50 px-3 py-1 rounded-lg">
                           <span className="truncate mr-2 flex-1">{item.name}</span>
                           <span className="font-bold shrink-0">x{item.quantity}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
             </>
          ) : (
            <>
              <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm relative">
                 <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin opacity-20"></div>
                 {getStatusIcon(activeOrder.status)}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                 {activeOrder.status === 'Pending' ? `Expected around ${activeOrder.prepTime || 15} mins` : activeOrder.status === 'Ready for Pickup' ? 'Packed in the customer outlet' : 'Order Preparing'}
              </h3>
              
              <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6 relative overflow-hidden">
                 <div className="flex justify-between items-center relative z-10 w-full px-2">
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-4 h-4 rounded-full ${['Pending', 'Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-300'}`}></div>
                       <span className={`text-[10px] font-bold ${['Pending', 'Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'text-indigo-600' : 'text-slate-400'}`}>Placed</span>
                    </div>
                    
                    <div className={`flex-1 h-1 mx-2 rounded-full ${['Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-4 h-4 rounded-full ${['Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-300'}`}></div>
                       <span className={`text-[10px] font-bold ${['Accepted', 'Ready for Pickup'].includes(activeOrder.status) ? 'text-indigo-600' : 'text-slate-400'}`}>Preparing</span>
                    </div>
                    
                    <div className={`flex-1 h-1 mx-2 rounded-full ${activeOrder.status === 'Ready for Pickup' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-4 h-4 rounded-full ${activeOrder.status === 'Ready for Pickup' ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-300'}`}></div>
                       <span className={`text-[10px] font-bold ${activeOrder.status === 'Ready for Pickup' ? 'text-indigo-600' : 'text-slate-400'}`}>Packed</span>
                    </div>
                 </div>
              </div>
              <p className="font-bold text-slate-500 mt-6 tracking-wide uppercase text-xs">{activeOrder.status}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (totalItems === 0) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}/>
      <div className={`fixed inset-x-0 bottom-0 z-50 flex flex-col items-center transform transition-transform duration-500 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] overflow-hidden shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)]">
          <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-5 px-6 bg-indigo-600 text-white cursor-pointer transition-colors">
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

          <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1 shrink-0 px-2 truncate">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                    <p className="text-slate-500 font-medium text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-xl border border-slate-200 shrink-0">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 bg-slate-50 p-4 border border-slate-200 rounded-2xl">
              <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /> Expected Pickup Time</label>
              <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500" />
            </div>

            <button onClick={handleCheckout} disabled={isCheckingOut} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50">
              {isCheckingOut ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : `Checkout • ₹${totalPrice}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
