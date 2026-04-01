import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { Camera, Loader2, Plus, Sparkles, CheckCircle2, X } from 'lucide-react';

const FlashPickup = ({ selectedShopId, onAddToCart, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    setStatus("Reading List...");

    try {
      // 1. OCR Step
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      
      if (!text.trim()) {
        setStatus("No text found.");
        setLoading(false);
        return;
      }

      setStatus("AI Matching...");

      // 2. AI Mapping Step - Backend now handles inventory fetching
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/smart-match`, {
        rawText: text,
        shopId: selectedShopId
      });

      // Ensure we always have an array, even if AI fails
      setAiSuggestions(Array.isArray(res.data) ? res.data : []);
      setStatus("Success!");
    } catch (err) {
      console.error("Scanning Error:", err);
      setStatus("Scan Failed");
      setAiSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 p-4">
      {/* Upload Section */}
      <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[40px] p-10 flex flex-col items-center text-center">
        {!imagePreview ? (
          <>
            <div className="bg-blue-600 p-5 rounded-3xl text-white mb-4 shadow-xl shadow-blue-200">
              <Camera size={32} />
            </div>
            <h3 className="text-lg font-black text-zinc-800 uppercase tracking-tighter">Flash Pickup</h3>
            <p className="text-xs text-zinc-500 font-bold mt-2 mb-6 px-4">
              Upload a photo of your handwritten list.
            </p>
            <label className="bg-zinc-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all">
              Choose Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </>
        ) : (
          <div className="relative w-full max-w-[200px]">
            <img src={imagePreview} alt="Preview" className="rounded-2xl shadow-lg border-4 border-white grayscale-[50%]" />
            {loading && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white p-4">
                <Loader2 className="animate-spin mb-2" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{status}</span>
              </div>
            )}
            {!loading && (
              <button 
                onClick={() => {setImagePreview(null); setAiSuggestions([]);}}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI Suggestions Section - Added Array check to prevent White Screen */}
      {Array.isArray(aiSuggestions) && aiSuggestions.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
          <div className="flex items-center gap-2 px-2">
            <Sparkles size={16} className="text-blue-600" />
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Smart AI Matches</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {aiSuggestions.map((item, i) => (
              <div key={i} className="bg-white border border-zinc-100 p-5 rounded-[32px] flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold italic line-clamp-1">"{item.userInput}"</span>
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Matched</span>
                  </div>
                  <h4 className="font-black text-zinc-800 text-sm mt-1">{item.match}</h4>
                  <p className="text-blue-600 font-black text-xs">₹{item.price}</p>
                </div>

                <button 
                  onClick={() => onAddToCart({ _id: item.id, name: item.match, price: item.price })}
                  className="ml-4 bg-zinc-900 hover:bg-blue-600 text-white p-4 rounded-2xl active:scale-90 transition-all shadow-lg"
                >
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-center gap-4 text-left">
            <CheckCircle2 size={24} className="text-blue-600 flex-shrink-0" />
            <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-tight">
              Please verify items before proceeding to checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashPickup;