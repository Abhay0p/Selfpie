import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CheckCircle2, Clock, PackageCheck, XCircle } from 'lucide-react';

const socket = io("http://localhost:5001"); // Point to your updated port

const MerchantDashboard = ({ shopId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 1. Join the shop's private room
    socket.emit('join_shop_room', shopId);

    // 2. Listen for NEW orders in real-time
    socket.on('new_order_alert', (newOrder) => {
      if (newOrder.shopId === shopId) {
        setOrders(prev => [newOrder, ...prev]);
        new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play(); // Notification sound
      }
    });

    return () => socket.off('new_order_alert');
  }, [shopId]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-black italic tracking-tighter">LIVE ORDERS</h2>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="bg-white border-2 border-zinc-100 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400">Order ID: #{order._id.slice(-5)}</span>
                <p className="text-lg font-black italic">₹{order.total}</p>
              </div>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                order.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
              }`}>
                {order.status}
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-bold text-zinc-600">
                  <span>{item.name} x {item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {order.status === 'Pending' && (
                <button 
                  onClick={() => updateStatus(order._id, 'Accepted')}
                  className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16}/> ACCEPT
                </button>
              )}
              {order.status === 'Accepted' && (
                <button 
                  onClick={() => updateStatus(order._id, 'Ready')}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <PackageCheck size={16}/> MARK READY
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-center text-zinc-400 font-bold py-20">Waiting for orders... ☕</p>}
      </div>
    </div>
  );
};

export default MerchantDashboard;