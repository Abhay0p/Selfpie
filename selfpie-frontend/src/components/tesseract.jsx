import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import { Camera, Zap, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const FlashPickup = ({ selectedShopId, onAddToCart }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus("Reading your list...");
    setProgress(0);

    try {
      // 1. OCR Processing
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });

      console.log("Extracted Text:", text);
      setStatus("Matching items with shop inventory...");

      // 2. Clean and Split Text
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 2);

      if (lines.length === 0) {
        setStatus("Could not read the list. Try a clearer photo.");
        setIsProcessing(false);
        return;
      }

      // 3. API Match & Add to Cart
      let matchCount = 0;
      for (const item of lines) {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/search?shopId=${selectedShopId}&query=${item}`
        );

        if (response.data && response.data.length > 0) {
          onAddToCart(response.data[0]);
          matchCount++;
        }
      }

      setStatus(matchCount > 0 
        ? `Added ${matchCount} items to your cart!` 
        : "List read, but no exact matches in this shop.");

    } catch (err) {
      console.error("OCR Error:", err);
      setStatus("Error processing image.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center py-8 bg-white rounded-[32px] shadow-sm border border-zinc-100 px-6">
      <div className="text-center mb-8">
        <div className="bg-yellow-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Zap className="text-yellow-600 fill-yellow-600" size={24} />
        </div>
        <h3 className="text-2xl font-black text-zinc-900 italic uppercase tracking-tighter">Flash Pickup</h3>
        <p className="text-zinc-500 text-xs font-bold mt-1">Upload list. Skip the aisles.</p>
      </div>

      <label className={`w-full h-64 border-4 border-dashed rounded-[40px] flex flex-col items-center justify-center cursor-pointer transition-all ${
        isProcessing ? 'border-blue-500 bg-blue-50' : 'border-zinc-100 hover:border-blue-400 bg-zinc-50'
      }`}>
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-2" />
            <span className="font-black text-blue-600 text-xl">{progress}%</span>
            <span className="text-[10px] font-bold text-blue-400 uppercase">Analyzing handwriting</span>
          </div>
        ) : (
          <>
            <div className="bg-blue-600 p-4 rounded-full mb-3 text-white shadow-lg shadow-blue-200">
              <Camera size={28} />
            </div>
            <span className="font-black text-zinc-800 uppercase text-xs tracking-widest">Snap Handwritten List</span>
          </>
        )}
        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isProcessing} />
      </label>

      {status && (
        <div className={`mt-6 w-full p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-tight ${
          status.includes("Added") ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-600'
        }`}>
          {status.includes("Added") ? <CheckCircle size={16} /> : <FileText size={16} />}
          {status}
        </div>
      )}
    </div>
  );
};

export default FlashPickup;