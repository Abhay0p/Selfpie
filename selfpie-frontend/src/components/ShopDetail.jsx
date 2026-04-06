import React, { useState } from 'react';
import { Camera, Zap, ScanBarcode, ArrowLeft, ShoppingCart } from 'lucide-react';
import Tesseract from 'tesseract.js';
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const ShopDetail = ({ shop, onBack }) => {
  const [mode, setMode] = useState(null); // 'flash' or 'scan'
  const [isProcessing, setIsProcessing] = useState(false);
  const [cart, setCart] = useState([]);

  // --- Flash Pickup: OCR Logic ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    Tesseract.recognize(file, 'eng', { logger: m => console.log(m) })
      .then(({ data: { text } }) => {
        console.log("OCR Result:", text);
        // Process text into a list (basic split by new lines)
        const items = text.split('\n').filter(item => item.trim().length > 2);
        alert(`Detected Items: ${items.join(', ')}`);
        setIsProcessing(false);
      });
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 bg-zinc-800 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold">{shop.shopName}</h2>
          <p className="text-zinc-500 text-sm">{shop.category}</p>
        </div>
        <div className="relative">
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {cart.length}
          </span>
        </div>
      </div>

      {!mode ? (
        <div className="grid gap-6">
          {/* Option 1: Flash Pickup */}
          <div 
            onClick={() => setMode('flash')}
            className="bg-blue-600 p-6 rounded-2xl flex flex-col items-center text-center cursor-pointer hover:bg-blue-500 transition-all"
          >
            <Zap size={48} className="mb-4 fill-white" />
            <h3 className="text-2xl font-bold mb-2">Flash Pickup</h3>
            <p className="text-blue-100 text-sm">Upload a photo of your handwritten list & let AI build your cart.</p>
          </div>

          {/* Option 2: Self-Checkout */}
          <div 
            onClick={() => setMode('scan')}
            className="bg-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center border border-zinc-700 cursor-pointer hover:border-blue-500 transition-all"
          >
            <ScanBarcode size={48} className="mb-4 text-blue-500" />
            <h3 className="text-2xl font-bold mb-2">In-Store Scan</h3>
            <p className="text-zinc-400 text-sm">Scan barcodes directly from the shelves while you shop.</p>
          </div>
        </div>
      ) : mode === 'flash' ? (
        /* Flash Pickup UI */
        <div className="flex flex-col items-center py-10">
          <h3 className="text-2xl font-bold mb-4">Upload Your List</h3>
          <p className="text-zinc-400 mb-8 text-center">Snapshot of your grocery list (English/Hindi)</p>
          
          <label className="w-64 h-64 border-2 border-dashed border-zinc-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all">
            {isProcessing ? (
              <p className="animate-pulse text-blue-400">Reading List...</p>
            ) : (
              <>
                <Camera size={48} className="mb-4 text-zinc-500" />
                <span className="text-zinc-500">Snap or Upload</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          
          <button onClick={() => setMode(null)} className="mt-8 text-zinc-500 underline">Switch Mode</button>
        </div>
      ) : (
        /* Barcode Scanner UI */
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-blue-600">
            <BarcodeScannerComponent
              width="100%"
              height={300}
              onUpdate={(err, result) => {
                if (result) {
                  alert(`Barcode Scanned: ${result.text}`);
                  setMode(null); // Go back after scan for now
                }
              }}
            />
          </div>
          <p className="mt-4 text-zinc-400">Align barcode within the frame</p>
          <button onClick={() => setMode(null)} className="mt-8 text-zinc-500 underline">Switch Mode</button>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;