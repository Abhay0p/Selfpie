import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, QrCode, LogOut, CheckCircle2, MessageSquare, AlertTriangle, PackageCheck, Loader2, Trash2, Edit, X, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '../config';

import { useMerchantAuth } from '../hooks/useMerchantAuth';
import { useMerchantOrders } from '../hooks/useMerchantOrders';
import { InventoryManager, ExitApproval, ShopSettings } from './Jayant_ShopkeeperShopIn';

function AuthView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [shopName, setShopName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [prepTime, setPrepTime] = useState(15);
  const { login } = useMerchantAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const result = await login(email, password, isLogin, shopName || "Grocery Store", location, upiId, prepTime);
        if (result.success) onLogin(result.data); else alert(result.error);
      }, async (err) => {
        const result = await login(email, password, isLogin, shopName || "Grocery Store", null, upiId, prepTime);
        if (result.success) onLogin(result.data); else alert(result.error);
      });
      return;
    }
    const result = await login(email, password, isLogin, shopName || "Grocery Store", null, upiId, prepTime);
    if (result.success) {
      onLogin(result.data);
    } else { alert(result.error); }
  };

  if (localStorage.getItem('customerToken')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6 mt-[-3rem]">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">You are currently a Customer</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Please log out of the customer app before attempting to access the merchant interface to prevent data overlap.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition">Return to App</Link>
          <button onClick={() => { localStorage.removeItem('customerToken'); window.location.reload(); }} className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition">Force Logout Customer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center relative overflow-hidden p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-dark p-6 sm:p-10 rounded-[2.5rem] w-full max-w-md relative z-10 m-auto"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white mx-auto">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white text-center mb-2">{isLogin ? 'Merchant Login' : 'Register Store'}</h2>
        <p className="text-center text-slate-400 text-sm mb-6">Manage your intelligent grocery queue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-5 py-4 bg-slate-900/60 focus:bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl font-medium outline-none transition-colors" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-5 py-4 bg-slate-900/60 focus:bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl font-medium outline-none transition-colors" />
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <input type="text" placeholder="Shop Name" value={shopName} onChange={e => setShopName(e.target.value)} required className="w-full px-5 py-4 bg-slate-900/60 focus:bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl font-medium outline-none transition-colors" />
              <input type="text" placeholder="UPI ID (e.g. user@okbank)" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-5 py-4 bg-slate-900/60 focus:bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl font-medium outline-none transition-colors" />
              <input type="number" placeholder="Preparation Time (mins)" value={prepTime} onChange={e => setPrepTime(Number(e.target.value))} className="w-full px-5 py-4 bg-slate-900/60 focus:bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl font-medium outline-none transition-colors" />
            </motion.div>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 mt-4">
            {isLogin ? 'Login to Store' : 'Sign Up Store'}
          </motion.button>
          <div className="text-center text-sm font-bold text-indigo-400 cursor-pointer pt-2 hover:text-indigo-300 transition-colors" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create new store account' : 'Already have an account?'}
          </div>
          <Link to="/" className="mt-8 flex items-center justify-center gap-2 p-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-2xl text-indigo-300 font-black transition-all">
            Switch to Customer Mode
          </Link>
        </form>
      </motion.div>
    </div>
  );
}

function DashboardHome({ activeOrders, shopId, onUpdateStatus }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-black text-white mb-1">Live Dashboard Overview</h2>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} className="hidden md:flex flex-col items-center glass-dark p-4 rounded-3xl border border-slate-700 shadow-sm cursor-pointer hover:shadow-indigo-500/10 transition-all">
          <h4 className="text-xs font-bold text-slate-400 mb-2 tracking-widest uppercase">Print Entrance QR</h4>
          <div className="bg-white p-2 rounded-2xl">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${shopId}&color=1e1b4b&bgcolor=ffffff`} alt="QR" className="" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Sales Today', value: '₹12,450', color: 'from-emerald-400 to-emerald-600' },
          { title: 'Items in Stock', value: '1,204', color: 'from-purple-400 to-purple-600' },
          { title: 'Pending Exits', value: activeOrders.length, color: 'from-rose-400 to-rose-600' }
        ].map((stat, i) => (
          <motion.div whileHover={{ y: -5 }} key={i} className="glass-dark rounded-[2rem] p-6 relative overflow-hidden group border border-slate-700">
            <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-40 rounded-full blur-2xl transition-opacity`}></div>
            <p className="text-slate-400 font-bold uppercase mb-2 text-xs tracking-wider">{stat.title}</p>
            <h3 className="text-4xl font-black text-white relative z-10">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Active Floor Queue</h3>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="space-y-4"
      >
        <AnimatePresence>
          {activeOrders.map((o, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={o.orderId} className="glass-dark text-left p-6 rounded-3xl border border-slate-700/50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-mono font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg text-sm mr-2 border border-slate-700/50">{o.orderId}</span>
                  <span className={`px-3 py-1 font-bold text-xs rounded-full border ${o.status === 'Pending' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : o.status === 'Accepted' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'}`}>{o.status}</span>
                  <p className="text-white font-black mt-3 text-lg">₹{o.total} <span className="text-slate-500 font-medium text-sm ml-2">({o.items.length} items to pick)</span></p>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700/50 mb-4 max-h-32 overflow-auto shadow-inner">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Customer Cart</p>
                <ul className="text-sm text-slate-300 font-medium space-y-1">
                  {o.items.map((i, idxx) => <li key={idxx}>• {i.quantity}x {i.name}</li>)}
                </ul>
              </div>

              <div className="flex gap-3">
                {o.status === 'Pending' && (
                  <>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onUpdateStatus(o.orderId, 'Accepted')} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-300 transition flex justify-center items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Accept Order</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onUpdateStatus(o.orderId, 'Rejected')} className="px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition border border-rose-100">Decline</motion.button>
                  </>
                )}
                {o.status === 'Accepted' && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onUpdateStatus(o.orderId, 'Ready for Pickup')} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-300 transition flex justify-center items-center gap-2"><PackageCheck className="w-5 h-5" /> Mark Ready for Pickup</motion.button>
                )}
                {o.status === 'Ready for Pickup' && (
                  <p className="text-emerald-600 font-bold bg-emerald-50 w-full p-3 rounded-xl text-center border border-emerald-100">Customer Gate Pass Unlocked. Waiting safely at Exits.</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {activeOrders.length === 0 && <div className="text-center py-10 font-bold text-slate-400">No active queue. Relax!</div>}
      </motion.div>
    </motion.div>
  );
}

function ShoppingHistory({ shopId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    fetch(`${API_BASE_URL}/api/history/${shopId}`)
      .then(res => res.json())
      .then(data => { if (data.success) setHistory(data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
    const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
    socket.on('order_status_changed', () => fetchHistory());
    socket.on('order_received', () => fetchHistory());
    return () => socket.disconnect();
  }, [shopId]);

  if (loading) return <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></div>;

  return (
    <div className="animate-in fade-in py-4">
      <h2 className="text-3xl font-black text-white mb-2">Shopping Log</h2>
      <p className="text-slate-400 font-medium mb-8">Real-time log of customer orders & payments.</p>

      <div className="space-y-4">
        {history.map((order) => (
          <div key={order._id} className="bg-slate-800/50 border text-left p-6 rounded-3xl shadow-sm border-slate-700/50 flex justify-between items-center group hover:bg-slate-800/80 transition">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono font-bold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-lg text-sm border border-slate-700">{order.orderIdString}</span>
                <span className={`px-3 py-1 font-bold text-xs rounded-full border ${order.status === 'Completed' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-3">{new Date(order.createdAt).toLocaleString()}</p>
              <div className="text-sm text-slate-300 font-bold max-w-md">
                {order.items.map(i => `${i.quantity}x ${i.name}`).join(' • ')}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-3xl font-black text-emerald-400">₹{order.total}</p>
            </div>
          </div>
        ))}
        {history.length === 0 && <div className="text-center py-10 font-bold text-slate-500">No trading history found.</div>}
      </div>
    </div>
  );
}

// External components imported from Jayant_ShopkeeperShopIn

export default function Yatharth_ShopkeeperPickup() {
  const { authData, setAuthData, logout } = useMerchantAuth();
  const { activeOrders, updateOrderStatus } = useMerchantOrders(authData?.shopId);
  const [chatModal, setChatModal] = useState(null);
  const location = useLocation();

  if (!authData) return <AuthView onLogin={() => setAuthData({ token: localStorage.getItem('merchantToken'), shopId: localStorage.getItem('merchantShopId') })} />;

  const navItems = [
    { name: 'Live Queue', path: '/merchant', icon: LayoutDashboard },
    { name: 'Shopping Log', path: '/merchant/history', icon: History },
    { name: 'Gate Scanner', path: '/merchant/exit', icon: QrCode },
    { name: 'Inventory DB', path: '/merchant/inventory', icon: PackageSearch },
    { name: 'Change Status', path: '/merchant/settings', icon: Edit }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-100px)] gap-4 lg:gap-6 animate-in fade-in duration-700 pt-4 relative">
      <aside className="w-full lg:w-64 glass-dark rounded-[2.5rem] shadow-2xl flex flex-col shrink-0 overflow-hidden z-20">
        <div className="px-6 pt-6 lg:pt-10 pb-4 lg:pb-6 text-xl font-black text-white tracking-tight flex flex-col lg:items-center border-b border-white/5">
          <span className="text-center w-full mb-2 lg:mb-4">Store Configuration</span>
          <div className="mx-auto p-2 bg-white rounded-2xl border border-slate-700 w-32 lg:w-full text-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${authData.shopId}&color=1e293b&bgcolor=ffffff`} alt="QR" className="mx-auto rounded-xl" /><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">Entrance ID</p></div>
        </div>
        <div className="p-4 lg:p-6 overflow-x-auto">
          <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 min-w-max pb-2 lg:pb-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/merchant');
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-4 py-3 lg:py-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-indigo-600 border border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-100' : ''}`} /> <span className="whitespace-nowrap">{item.name}</span>
                  {item.name === 'Live Queue' && activeOrders.length > 0 && <span className="ml-2 lg:ml-auto w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs animate-bounce shrink-0">{activeOrders.length}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 lg:p-6 text-white"><button onClick={logout} className="flex items-center justify-center lg:justify-start gap-3 text-rose-400 font-bold px-4 py-3 w-full rounded-2xl hover:bg-rose-900/30 border border-transparent hover:border-rose-500/30"><LogOut className="w-5 h-5" /> <span className="whitespace-nowrap">Logout</span></button></div>
      </aside>

      <main className="flex-1 glass-dark rounded-[2.5rem] border border-white/5 p-4 lg:p-8 overflow-y-auto lg:overflow-y-auto overflow-x-hidden shadow-2xl relative min-h-[50vh] z-20">
        <Routes>
          <Route path="/" element={<DashboardHome activeOrders={activeOrders} shopId={authData.shopId} onUpdateStatus={updateOrderStatus} />} />
          <Route path="/history" element={<ShoppingHistory shopId={authData.shopId} />} />
          <Route path="/exit" element={<ExitApproval shopId={authData.shopId} />} />
          <Route path="/inventory" element={<InventoryManager shopId={authData.shopId} />} />
          <Route path="/settings" element={<ShopSettings shopId={authData.shopId} />} />
        </Routes>
      </main>

    </div>
  );
}
