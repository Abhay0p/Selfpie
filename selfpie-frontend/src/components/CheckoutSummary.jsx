import React, { useState } from 'react';
import axios from 'axios';
import { X, Minus, Plus, ShoppingBasket, Smartphone, CreditCard } from 'lucide-react';

const CheckoutSummary = ({ cart, shop, updateCart, onOrderPlaced, onClose }) => {
  const [step, setStep] = useState('summary'); // 'summary' or 'payment'
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleConfirmOrder = async () => {
    try {
      const orderData = {
        shopId: shop._id,
        items: cart.map(item => ({ 
          name: item.name, 
          quantity: item.quantity, 
          price: item.price 
        })),
        total: totalPrice,
        status: 'Pending'
      };
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData);
      onOrderPlaced(res.data._id); // Send ID back to App.jsx to start polling
    } catch (err) {
      alert("Failed to place order. Check console.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-2xl bg-white rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBasket className="text-blue-600" />
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Your Basket</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full"><X size={20}/></button>
        </div>

        {step === 'summary' ? (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-zinc-800">{item.name}</h4>
                    <p className="text-[10px] font-black text-blue-600">₹{item.price * item.quantity}</p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 bg-white border border-zinc-200 p-1 rounded-xl">
                    <button onClick={() => updateCart(item, 'decrease')} className="p-1 text-zinc-400 hover:text-red-500"><Minus size={14}/></button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateCart(item, 'add')} className="p-1 text-zinc-400 hover:text-blue-600"><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-100 pt-6 mb-8">
              <div className="flex justify-between items-center font-black text-lg">
                <span>Grand Total</span>
                <span className="text-blue-600">₹{totalPrice}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep('payment')}
              className="w-full bg-zinc-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
              <Smartphone size={20} /> Proceed to Pay
            </button>
          </>
        ) : (
          <div className="text-center">
            <h3 className="font-black text-sm uppercase text-zinc-400 mb-6 tracking-[0.2em]">UPI Payment Verification</h3>
            
            {/* Static QR Image - Place payment-qr.png in your /public folder */}
            <div className="bg-blue-50 p-6 rounded-[32px] border-2 border-dashed border-blue-200 mb-8 flex flex-col items-center">
              <img 
                src="/payment-qr.png" 
                alt="Payment QR" 
                className="w-48 h-48 object-contain rounded-2xl border-4 border-white shadow-lg mb-4"
                onError={(e) => e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=YOUR_UPI_ID@okicici"}
              />
              <p className="text-[10px] font-black text-blue-800 uppercase italic">Scan to pay exactly ₹{totalPrice}</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleConfirmOrder}
                className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                I Have Paid (Confirm Order)
              </button>
              <button 
                onClick={() => setStep('summary')}
                className="w-full text-zinc-400 font-bold text-xs uppercase py-2"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSummary;