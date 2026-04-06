import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, PackageCheck, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';

const ShopkeeperDashboard = ({ shopId }) => {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null); // Order selected for QR generation

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/shop/${shopId}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black italic">MERCHANT TERMINAL</h1>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span> Online
        </div>
      </div>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-zinc-800/50 rounded-[40px] border border-zinc-700">
            <AlertCircle size={48} className="mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-500 font-bold">No active pickup requests</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-zinc-800 p-6 rounded-[32px] border border-zinc-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Order ID: {order._id.slice(-6)}</span>
                  <h3 className="text-xl font-bold">₹{order.totalPrice}</h3>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                  order.status === 'Ready' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  {order.status}
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-2 mb-6 text-zinc-400 text-sm">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {order.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Preparing')}
                    className="flex-1 bg-blue-600 py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <Clock size={16} /> Accept Order
                  </button>
                )}
                {order.status === 'Preparing' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Ready')}
                    className="flex-1 bg-green-600 py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <PackageCheck size={16} /> Mark as Ready
                  </button>
                )}
                {order.status === 'Ready' && (
                  <button 
                    onClick={() => setActiveOrder(order)}
                    className="flex-1 bg-white text-black py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <QrCode size={16} /> Generate Handover QR
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Handover QR Modal (The "MyCamu" Style part) */}
      {activeOrder && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-[40px] text-center">
            <h2 className="text-zinc-900 font-black mb-2">VERIFY HANDOVER</h2>
            <p className="text-zinc-500 text-xs mb-6 uppercase font-bold tracking-tighter">Scan to confirm customer received items</p>
            
            <div className="p-4 bg-zinc-50 rounded-3xl mb-6">
              <QRCodeSVG value={JSON.stringify({ orderId: activeOrder._id, status: 'Completed' })} size={200} />
            </div>

            <button 
              onClick={() => setActiveOrder(null)}
              className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperDashboard;