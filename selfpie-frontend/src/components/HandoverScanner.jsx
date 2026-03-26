import React from 'react';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { QrCode, X } from 'lucide-react';

const HandoverScanner = ({ onScanSuccess, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6">
      <button 
        onClick={onClose} 
        className="absolute top-10 right-6 text-white bg-zinc-800 p-2 rounded-full active:scale-90 transition-transform"
      >
        <X size={24} />
      </button>
      
      <div className="text-center mb-8">
        <QrCode size={48} className="text-blue-500 mx-auto mb-2" />
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Scan Verification</h2>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Scan the QR on the Merchant's screen</p>
      </div>

      <div className="w-full max-w-sm aspect-square overflow-hidden rounded-[40px] border-4 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.3)] bg-zinc-900">
        <BarcodeScannerComponent
          width="100%"
          height="100%"
          onUpdate={(err, result) => {
            if (result) {
              onScanSuccess(result.text);
            }
          }}
        />
      </div>

      <p className="mt-8 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
        SelfPie Secure Handover Protocol
      </p>
    </div>
  );
};

// THIS IS THE LINE VITE IS COMPLAINING ABOUT:
export default HandoverScanner;