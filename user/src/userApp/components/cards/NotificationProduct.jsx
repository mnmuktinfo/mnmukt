import React, { useEffect } from "react";
import { Check, X, AlertCircle } from "lucide-react";

const NotificationProduct = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto close after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-sm">
      <div className="bg-slate-950 text-white p-4 shadow-2xl flex items-center justify-between border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-3">
          {type === "success" ? (
            <div className="bg-[#ff356c] p-1 rounded-full">
              <Check size={14} className="text-white" />
            </div>
          ) : (
            <AlertCircle size={18} className="text-red-500" />
          )}
          <p className="text-[11px] uppercase tracking-[0.2em] font-black">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="opacity-50 hover:opacity-100 transition-opacity">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationProduct;
