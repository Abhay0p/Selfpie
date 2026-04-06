import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const InventoryGrid = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Amul Milk 1L', price: 66, stock: 12, category: 'Dairy' },
    { id: 2, name: 'Lays Magic Masala', price: 20, stock: 45, category: 'Snacks' },
  ]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Shop Inventory</h1>
        <button className="bg-green-600 text-white p-2 rounded-full shadow-lg">
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
               <Package className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            <p className="text-green-600 font-bold text-xs">₹{item.price}</p>
            <div className="flex justify-between items-center mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                Qty: {item.stock}
              </span>
              <div className="flex gap-2 text-gray-400">
                <Edit size={14} />
                <Trash2 size={14} className="text-red-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryGrid;