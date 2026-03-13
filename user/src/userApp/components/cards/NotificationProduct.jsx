import React, { useEffect, useState } from "react";
import { Check, X, AlertCircle, Info, ShoppingBag } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   NotificationProduct — Streetwear / Modern E-commerce Edition
   Aesthetic: Sharp edges, high contrast, bold typography
───────────────────────────────────────────────────────────── */

const STYLES = `
  .toast-enter {
    animation: toastIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  .toast-exit {
    animation: toastOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards;
  }
  @keyframes toastIn {
    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
    to   { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes toastOut {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to   { transform: translateX(-50%) translateY(20px); opacity: 0; }
  }

  .toast-progress {
    animation: toastDrain 3.7s linear forwards;
  }
  @keyframes toastDrain {
    from { width: 100%; }
    to   { width: 0%; }
  }
`;

const CONFIG = {
  success: {
    icon: Check,
    colorBar: "bg-green-600",
    label: "SUCCESS",
  },
  error: {
    icon: AlertCircle,
    colorBar: "bg-[#e11b22]", // Matches the Add to Cart button
    label: "ERROR",
  },
  info: {
    icon: ShoppingBag,
    colorBar: "bg-gray-900",
    label: "BAGGED",
  },
};

const NotificationProduct = ({ message, type = "success", onClose }) => {
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 250);
  };

  /* Auto-close after 4 seconds */
  useEffect(() => {
    const timer = setTimeout(handleClose, 4000);
    return () => clearTimeout(timer);
  }, []);

  const config = CONFIG[type] || CONFIG.success;
  const Icon = config.icon;

  return (
    <>
      <style>{STYLES}</style>

      <div
        className={`fixed bottom-6 md:bottom-8 left-1/2 z-[9999] w-[90%] max-w-sm font-sans ${
          exiting ? "toast-exit" : "toast-enter"
        }`}
        style={{ transform: "translateX(-50%)" }}
        role="alert"
        aria-live="polite">
        <div className="bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] flex items-stretch overflow-hidden relative">
          {/* Left Solid Color Block */}
          <div
            className={`w-12 flex-shrink-0 flex items-center justify-center ${config.colorBar} text-white`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>

          {/* Text Content */}
          <div className="flex-1 py-3 px-4 flex flex-col justify-center min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-0.5">
              {config.label}
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Dismiss"
            className="px-4 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors border-l border-gray-200">
            <X size={16} strokeWidth={2.5} />
          </button>

          {/* Draining Progress Bar */}
          <div
            className={`absolute bottom-0 left-12 right-0 h-1 ${config.colorBar} toast-progress origin-left`}
          />
        </div>
      </div>
    </>
  );
};

export default NotificationProduct;
