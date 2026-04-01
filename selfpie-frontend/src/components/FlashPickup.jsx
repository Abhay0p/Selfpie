import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import { Search, Plus, Loader2, Camera, ShoppingBag, AlertCircle } from 'lucide-react';

const FlashPickup = ({ selectedShopId, onAddToCart }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // --- 1. AUTO-LOAD ITEMS ON ENTRY ---
  useEffect(() => {
    const fetchInitialProducts = async () => {
      if (!selectedShopId) return;
      setLoading(true);
      try {
        // Fetching with an empty query returns all products for this shop
        const res = await axios.get(`http://localhost:5001/api/products/search`, {
          params: { shopId: selectedShopId, query: "" }
        });
        setResults(res.data);
      } catch (err) {
        console.error("Initial load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialProducts();
  }, [selectedShopId]);

  // --- 2. MANUAL SEARCH LOGIC ---
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/products/search`, {
        params: { shopId: selectedShopId, query: query }
      });
      setResults(res.data);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. TESSERACT OCR WITH PRE-PROCESSING ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingImage(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        // Create a canvas to sharpen the image for better AI reading
        const canvas = document.createElement('canvas');
        const ctx = canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext('2d');
        
        // Apply High Contrast & Grayscale to stop "Gibberish"
        context.filter = 'grayscale(100%) contrast(150%) brightness(110%)';
        context.drawImage(img, 0, 0);
        
        const processedDataUrl = canvas.toDataURL('image/jpeg', 1.0);

        try {
          const { data: { text } } = await Tesseract.recognize(processedDataUrl, 'eng');
          
          // Clean text: Remove special chars and take the first recognized line
          const cleanedLine = text.replace(/[^a-zA-Z0-9 ]/g, "").split('\n')[0].trim();
          
          if (cleanedLine) {
            setQuery(cleanedLine);
            // Auto-search the recognized text
            const res = await axios.get(`http://localhost:5001/api/products/search`, {
              params: { shopId: selectedShopId, query: cleanedLine }
            });
            setResults(res.data);
          }
        } catch (err) {
          console.error("OCR Failed:", err);
        } finally {
          setIsProcessingImage(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4 animate-in fade-in duration-500">
      
      {/* --- SEARCH & CAMERA BAR --- */}
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search items or upload list..." 
            className="w-full bg-white border-2 border-zinc-100 rounded-[24px] py-4 px-6 font-bold text-zinc-800 focus:border-blue-600 transition-all outline-none shadow-sm placeholder:text-zinc-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-900 text-white p-2.5 rounded-xl hover:bg-zinc-800 transition-colors">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </form>

        <label className="cursor-pointer bg-blue-600 text-white p-4 rounded-[24px] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center">
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          {isProcessingImage ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
        </label>
      </div>

      {/* --- AI PROCESSING TOAST --- */}
      {isProcessingImage && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="p-2 bg-white rounded-lg"><Loader2 className="animate-spin text-blue-600" size={16} /></div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Optimizing Image & Reading List...</p>
        </div>
      )}

      {/* --- PRODUCT GRID --- */}
      <div className="grid grid-cols-1 gap-3 pb-20">
        {results.length > 0 ? (
          results.map((product) => (
            <div key={product._id} className="bg-white border border-zinc-100 p-5 rounded-[32px] flex justify-between items-center shadow-sm hover:shadow-md hover:border-zinc-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="font-black text-zinc-800 text-sm leading-none mb-1">{product.name}</h4>
                  <p className="text-blue-600 font-black text-xs">₹{product.price}</p>
                </div>
              </div>
              <button 
                onClick={() => onAddToCart(product)}
                className="bg-zinc-900 text-white p-4 rounded-2xl active:scale-90 transition-all shadow-lg shadow-zinc-200 hover:bg-blue-600"
              >
                <Plus size={20} />
              </button>
            </div>
          ))
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-300">
              <AlertCircle size={40} strokeWidth={1} className="mb-2" />
              <p className="text-xs font-bold italic">No items found in this store</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FlashPickup;