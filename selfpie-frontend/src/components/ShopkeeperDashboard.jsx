import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Smartphone, ScanLine, CheckCircle2, X, Clock, ChevronRight } from 'lucide-react';
// Import your existing scanner component
import HandoverScanner from './HandoverScanner'; 

const ShopkeeperDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanId, setActiveScanId] = useState(null);

  // Demo Data for your presentation
  const demoOrders = [
    {
      _id: "65f2a1b2c3d4e5f67890abcd",
      customerName: "Abhay Singh",
      items: [{ name: "Amul Gold Milk", quantity: 2 }, { name: "Maggi Masala", quantity: 4 }],
      total: 156,
      status: "Ready",
      timestamp: "2 mins ago"
    },
    {
      _id: "65f2a1b2c3d4e5f67890efgh",
      customerName: "Rahul Verma",
      items: [{ name: "Britannia Bread", quantity: 1 }],
      total: 45,
      status: "Pending",
      timestamp: "Just Now"
    }
  ];

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`);
      const realOrders = res.data.filter(o => o.status !== 'Completed');
      setOrders(realOrders.length > 0 ? realOrders : demoOrders);
    } catch (err) {
      setOrders(demoOrders);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (id.startsWith("65f2")) { // If it's a demo order
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
      return;
    }
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, { status: newStatus });
    fetchOrders();
  };

  const handleQrSuccess = async (scannedOrderId) => {
    // This triggers when the merchant successfully scans the customer's QR
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/orders/${scannedOrderId}`, { status: 'Completed' });
      alert("Handover Verified! Order successfully completed.");
      setIsScanning(false);
      fetchOrders();
    } catch (err) {
      alert("Error: Order ID doesn't match or server is down.");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-black italic text-blue-500 tracking-tighter">MERCHANT DASHBOARD</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Store Terminal Active</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {orders.map(order => (
          <div key={order._id} className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 shadow-2xl backdrop-blur-sm">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600/10 p-3 rounded-2xl">
                  <Smartphone size={22} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-black text-base">{order.customerName || "Customer"}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">ID: ...{order._id.slice(-6)}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {order.status}
              </span>
            </div>

            {/* Items Summary */}
            <div className="space-y-2 mb-6 bg-black/30 p-4 rounded-2xl border border-zinc-800/50">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-xs font-bold text-zinc-400">
                  <span>{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
              <div className="pt-3 mt-1 border-t border-zinc-800 flex justify-between text-blue-500 font-black text-sm">
                <span>Total Amount</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {order.status === 'Pending' && (
                <button 
                  onClick={() => updateStatus(order._id, 'Preparing')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl text-xs font-black uppercase transition-all"
                >
                  Accept & Start Packing
                </button>
              )}
              
              {order.status === 'Preparing' && (
                <button 
                  onClick={() => updateStatus(order._id, 'Ready')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl text-xs font-black uppercase shadow-lg shadow-blue-900/20 transition-all"
                >
                  Mark as Ready
                </button>
              )}

              {order.status === 'Ready' && (
                <button 
                  onClick={() => setIsScanning(true)}
                  className="w-full bg-zinc-100 hover:bg-white text-zinc-900 py-4 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 transition-all"
                >
                  <ScanLine size={18} /> Verify & Handover (Scan QR)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QR Scanner Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8">
          <div className="relative w-full max-w-sm aspect-square bg-zinc-900 rounded-[40px] border-2 border-blue-500 overflow-hidden">
             {/* Replace this div with your real scanner component logic */}
             <HandoverScanner onScanSuccess={handleQrSuccess} onClose={() => setIsScanning(false)} />
          </div>
          
          <div className="mt-10 text-center">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Scan Customer Phone</h2>
            <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest">Scanning will complete the handover</p>
          </div>

          <button 
            onClick={() => setIsScanning(false)}
            className="mt-12 bg-zinc-800 p-4 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
          <Package size={60} strokeWidth={1} className="mb-4" />
          <p className="font-black text-xs uppercase tracking-widest">No orders today</p>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperDashboard;