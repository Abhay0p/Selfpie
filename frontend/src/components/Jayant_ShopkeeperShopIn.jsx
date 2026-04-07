import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, QrCode, LogOut, CheckCircle2, MessageSquare, AlertTriangle, PackageCheck, Loader2, Trash2, Edit, X, History } from 'lucide-react';
import { io } from 'socket.io-client';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '../config';

import { useMerchantAuth } from '../hooks/useMerchantAuth';
import { useMerchantOrders } from '../hooks/useMerchantOrders';

function ShopSettings({ shopId }) {
  const [formData, setFormData] = useState({ shopName: '', upiId: '', prepTime: 15 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if(res.ok) setSuccess(true);
    } catch(err) { console.error(err); }
    finally { setLoading(false); setTimeout(() => setSuccess(false), 3000); }
  };

  return (
    <div className="animate-in fade-in py-4 max-w-2xl">
      <h2 className="text-3xl font-black text-slate-800 mb-2">Store Configuration</h2>
      <p className="text-slate-500 font-medium mb-8">Update your store details and preferences.</p>
      
      <form onSubmit={handleUpdate} className="space-y-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm relative">
        {success && <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Saved!</div>}
        
        <div>
           <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block uppercase">Shop Name</label>
           <input type="text" value={formData.shopName} onChange={e=>setFormData({...formData, shopName:e.target.value})} placeholder="New Store Name" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition" />
        </div>
        <div>
           <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block uppercase">UPI ID for Payments</label>
           <input type="text" value={formData.upiId} onChange={e=>setFormData({...formData, upiId:e.target.value})} placeholder="username@bank" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition" />
        </div>
        <div>
           <label className="text-sm font-bold text-slate-500 ml-1 mb-2 block uppercase">Default Preparation Time (Minutes)</label>
           <input type="number" value={formData.prepTime} onChange={e=>setFormData({...formData, prepTime:Number(e.target.value)})} min="1" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition" />
        </div>
        
        <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:bg-indigo-400">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
function InventoryManager({ shopId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', barcode: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/${shopId}`);
      const result = await res.json();
      if(result.success) setItems(result.data);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_BASE_URL}/api/inventory/${shopId}/${editingId}` : `${API_BASE_URL}/api/inventory/${shopId}`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, price: Number(formData.price), stock: Number(formData.stock) }) });
      if(res.ok) { 
        setFormData({ name: '', price: '', stock: '', barcode: '' }); setEditingId(null); fetchInventory(); 
        const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
        socket.emit('inventory_changed', { shopId });
      }
    } catch(err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete item?")) return;
    try { 
      await fetch(`${API_BASE_URL}/api/inventory/${shopId}/${id}`, { method: 'DELETE' }); 
      fetchInventory(); 
      const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
      socket.emit('inventory_changed', { shopId });
    } 
    catch(err) { console.error(err); }
  };

  const toggleStock = async (item) => {
    const newStock = item.stock > 0 ? 0 : 50; 
    try {
      await fetch(`${API_BASE_URL}/api/inventory/${shopId}/${item._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: newStock }) });
      fetchInventory();
      const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
      socket.emit('inventory_changed', { shopId });
    } catch(err) { console.error(err); }
  };

  if(loading) return <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" /></div>;

  return (
    <div className="animate-in fade-in py-4">
      <h2 className="text-3xl font-black text-slate-800 mb-8">Inventory Catalog</h2>
      <form onSubmit={handleSave} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 flex flex-wrap gap-4 items-end shadow-sm">
         <div className="flex-1 min-w-[200px]"><label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase">Name</label><input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" /></div>
         <div className="w-32"><label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase">Price (₹)</label><input type="number" required min="0" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" /></div>
         <div className="w-32"><label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase">Stock</label><input type="number" required min="0" value={formData.stock} onChange={e=>setFormData({...formData, stock:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" /></div>
         <div className="flex-1 min-w-[150px]"><label className="text-xs font-bold text-slate-500 ml-1 mb-1 block uppercase">Barcode</label><input type="text" value={formData.barcode} onChange={e=>setFormData({...formData, barcode:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200" /></div>
         <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">{editingId?'Update':'Add Item'}</button>
      </form>

      <table className="w-full text-left border-collapse bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <thead><tr className="bg-slate-50 text-slate-500 font-bold uppercase text-xs"><th className="p-4">Product</th><th className="p-4">Pricing</th><th className="p-4 text-center">Fast Status Toggle</th><th className="p-4 text-right">Actions</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i._id} className="border-t border-slate-50">
              <td className="p-4 font-bold text-slate-800">{i.name} <div className="text-slate-400 font-mono text-xs font-normal">{i.barcode||'No barcode'}</div></td>
              <td className="p-4 font-black tracking-tight">₹{i.price}</td>
              <td className="p-4 text-center">
                 <button onClick={()=>toggleStock(i)} className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all focus:scale-95 ${i.stock > 0 ? 'bg-emerald-100 text-emerald-700 hover:bg-rose-100 hover:text-rose-700' : 'bg-rose-100 text-rose-700 hover:bg-emerald-100 hover:text-emerald-700'}`}>
                   {i.stock > 0 ? `In Stock (${i.stock})` : 'Out of Stock'}
                 </button>
              </td>
              <td className="p-4 text-right">
                <button onClick={()=>{setFormData({name:i.name,price:i.price,stock:i.stock,barcode:i.barcode});setEditingId(i._id);}} className="p-2 text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                <button onClick={()=>handleDelete(i._id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExitApproval({ shopId }) {
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;

    let isMounted = true;
    let html5QrCode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("door-reader", false);
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!isMounted) return;
            setIsScanning(false);
            handleAPIValidation(decodedText);
          },
          () => {} // Ignore read errors silently
        );

        if (!isMounted && html5QrCode.isScanning) {
          await html5QrCode.stop();
          html5QrCode.clear();
        }
      } catch (err) {
        if (isMounted) console.error("Failed to start exit scanner", err);
      }
    };

    // Stagger start slightly to fix double hardware locks in strict mode mounting
    const timeoutId = setTimeout(startScanner, 150);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => html5QrCode.clear())
          .catch(err => console.error("Error stopping exit scanner cleanly", err));
      }
    };
  }, [isScanning]);

  const handleAPIValidation = async (orderIdString) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/exit-validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderIdString, shopId }) });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      if (data.success) {
         const socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
         socket.emit('update_order_status', { orderId: orderIdString, status: 'Completed' });
      }
    } catch(err) { setResult({ success: false, message: 'Server error processing exit logic.' }); }
  };

  return (
    <div className="max-w-2xl mx-auto text-center animate-in fade-in py-10">
      <h2 className="text-3xl font-black text-slate-800 mb-4">Gatekeeper QR Scanner</h2>
      
      {isScanning ? (
         <div className="mb-8 p-4 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative mx-auto max-w-sm">
            <div id="door-reader" className="w-full aspect-square [&>video]:object-cover [&>video]:w-full [&>video]:h-full [&>div]:hidden bg-slate-900 rounded-2xl overflow-hidden"></div>
         </div>
      ) : (
         <button onClick={() => { setIsScanning(true); setResult(null); }} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl mb-6 font-bold shadow-lg transition active:scale-95">
           Scan Another Gate Pass
         </button>
      )}

      {result && <div className={`p-6 rounded-3xl font-bold border text-lg max-w-sm mx-auto ${result.success ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm'}`}>{result.message}</div>}
    </div>
  );
}
export { InventoryManager, ExitApproval, ShopSettings };
