import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Package } from 'lucide-react';

const NotificationBar = ({ status }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if status is Preparing or Ready
    if (status && (status === 'Preparing' || status === 'Ready')) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 6000); 
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible) return null;

  const getDetails = () => {
    switch(status) {
      case 'Preparing': 
        return { msg: "Shopkeeper is packing your items", icon: <Package size={16}/>, color: "bg-blue-600" };
      case 'Ready': 
        return { msg: "Order is ready! Head to the counter.", icon: <CheckCircle size={16}/>, color: "bg-green-600" };
      default: 
        return { msg: "Order status updated", icon: <Bell size={16}/>, color: "bg-zinc-800" };
    }
  };

  const details = getDetails();

  return (
    <div className={`fixed top-20 left-4 right-4 z-[100] ${details.color} text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-500`}>
      <div className="bg-white/20 p-2 rounded-full">
        {details.icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">SelfPie Update</p>
        <p className="text-sm font-bold">{details.msg}</p>
      </div>
    </div>
  );
};

export default NotificationBar;