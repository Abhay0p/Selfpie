import React, { useState } from 'react';
import axios from 'axios';
import { X, ReceiptText, Clock, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

const CheckoutSummary = ({ cart, shop, onClose, onOrderPlaced, onClearCart }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Create the order object for the backend
    const orderData = {
      shopId: shop._id,
      items: cart,
      totalPrice: total,
      customerId: "User_Abhay", // Mock user ID for now
      status: 'Pending'
    };

    try {
      // 1. Send order to MongoDB
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData);
      
      // 2. Mock UPI Payment Delay
      setTimeout(() => {
        setPaymentDone(true);
        setIsProcessing(false);
        
        // 3. Notify App.jsx to start the Poller/Tracker
        onOrderPlaced(res.data._id); 
      }, 2000);

    } catch (err) {
      console.error("Order failed:", err);
      alert("Something went wrong. Check if backend is running.");
      setIsProcessing(false);
    }
  };

  if (paymentDone) {
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={48} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-zinc-900 italic uppercase tracking-tighter">Payment Verified</h2>
        <p className="text-zinc-500 mt-2 mb-8 font-medium">Your order has been sent to <br/> <span className="text-zinc-900 font-bold">{shop.shopName}</span></p>
        
        <div className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl p-6 mb-10">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Pickup Instructions</p>
          <p className="text-sm text-zinc-700 leading-relaxed">
            Please wait for the <b>"Ready"</b> notification. Once ready, head to the counter and scan the shopkeeper's QR code.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          Track My Order
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[40px] p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic flex items-center gap-2">
            <ReceiptText className="text-blue-600" /> BILLING
          </h2>
          <button onClick={onClose} className="bg-zinc-100 p-2 rounded-full text-zinc-500 hover:bg-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Item List */}
        <div className="space-y-4 mb-8">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Items in Cart</p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-zinc-50/50 p-3 rounded-2xl">
                <div>
                  <p className="font-bold text-sm text-zinc-900">{item.name}</p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase">Qty: {item.quantity || 1}</p>
                </div>
                <p className="font-black text-zinc-900">₹{item.price * (item.quantity || 1)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Breakdown */}
        <div className="bg-blue-50/50 p-6 rounded-[32px] mb-8 border border-blue-100">
          <div className="flex justify-between text-sm mb-2 text-zinc-600 font-bold">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between text-sm mb-4 text-green-600 font-bold">
            <span>Pickup Handling</span>
            <span className="uppercase italic text-[10px] bg-green-100 px-2 py-0.5 rounded-md">Free</span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-4 mt-2">
            <span className="text-zinc-900 font-black text-xl italic uppercase tracking-tighter">Total Amount</span>
            <span className="text-blue-600 font-black text-2xl">₹{total}</span>
          </div>
        </div>

        <button 
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
            isProcessing ? 'bg-zinc-200 text-zinc-400' : 'bg-blue-600 text-white shadow-blue-100'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} /> VERIFYING UPI...
            </>
          ) : (
            <>
              PAY ₹{total} <ArrowRight size={20} />
            </>
          )}
        </button>
        
        <p className="text-center mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Secured by SelfPie Payments
        </p>
      </div>
    </div>
  );
};

export default CheckoutSummary;