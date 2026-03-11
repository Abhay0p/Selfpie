import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Loader2, Send } from 'lucide-react';
import axios from 'axios';

const FlashPickup = ({ selectedShopId }) => {
  const [loading, setLoading] = useState(false);
  const [listItems, setListItems] = useState([]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'hin+eng', {
        logger: m => console.log(m)
      });

      const items = text.split('\n').filter(i => i.trim().length > 2);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/flash-pickup/search`, {
        shopId: selectedShopId,
        items: items
      });

      setListItems(response.data);
    } catch (error) {
      console.error("OCR or Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-blue-50">
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p className="text-sm font-medium text-blue-800">Reading your list...</p>
          </div>
        ):(
          <label className="cursor-pointer flex flex-col items-center">
            <Camera size={48} className="text-blue-600 mb-2" />
            <span className="text-sm text-blue-700 font-semibold text-center">
              Take a photo of your list (Hindi/English)
            </span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      {listItems.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold mb-4">Detected Items</h2>
          {listItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border-b">
              <span className="text-sm">{item.name || item}</span>
              <span className="text-green-600 font-bold">₹{item.price || '--'}</span>
            </div>
          ))}
          <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl flex justify-center items-center gap-2">
            <Send size={18} /> Send Demand to Shop
          </button>
        </div>
      )}
    </div>
  );
};

export default FlashPickup;