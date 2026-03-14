import React, { useEffect, useState } from "react";
import { CheckCircle2, X, AlertCircle, ShoppingBag } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   NotificationProduct — Premium App Edition
   Aesthetic: Floating pill, soft glass shadows, bottom-aligned
───────────────────────────────────────────────────────────── */

const STYLES = `
  .toast-progress {
    animation: toastDrain 3.5s linear forwards;
  }
  @keyframes toastDrain {
    from { width: 100%; }
    to   { width: 0%; }
  }
`;

const CONFIG = {
  success: {
    icon: CheckCircle2,
    accentText: "text-emerald-500",
    accentBg: "bg-emerald-50",
    progressBg: "bg-emerald-500",
    label: "Success",
  },
  error: {
    icon: AlertCircle,
    accentText: "text-[#ff3f6c]", // Myntra Pink
    accentBg: "bg-pink-50",
    progressBg: "bg-[#ff3f6c]",
    label: "Attention",
  },
  info: {
    icon: ShoppingBag,
    accentText: "text-[#ff3f6c]", // Myntra Pink
    accentBg: "bg-pink-50",
    progressBg: "bg-[#ff3f6c]",
    label: "Added to Bag",
  },
};

const NotificationProduct = ({ message, type = "success", onClose }) => {
  const [isShowing, setIsShowing] = useState(false);

  // Determine type based on message content if type isn't explicitly passed
  const resolvedType = message.toLowerCase().includes("bag") ? "info" : type;
  const config = CONFIG[resolvedType] || CONFIG.success;
  const Icon = config.icon;

  useEffect(() => {
    // Trigger entrance animation shortly after mount
    requestAnimationFrame(() => setIsShowing(true));

    // Auto-close timer
    const timer = setTimeout(() => {
      handleClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsShowing(false);
    // Wait for exit animation to finish before unmounting
    setTimeout(onClose, 300);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Wrapper to position the toast */}
      <div
        className="fixed z-[10000] bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:min-w-[380px] flex justify-center pointer-events-none"
        role="alert">
        {/* Main Toast Container */}
        <div
          className={`pointer-events-auto w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isShowing
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-8 opacity-0 scale-95"
          }`}>
          <div className="flex items-center p-3 sm:p-4">
            {/* Icon Block */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.accentBg} ${config.accentText} mr-4`}>
              <Icon size={20} strokeWidth={2.5} />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">
                {config.label}
              </p>
              <p className="text-[14px] font-semibold text-gray-900 truncate leading-tight">
                {message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-4 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors active:scale-95"
              aria-label="Close notification">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-[3px] bg-gray-100">
            <div
              className={`h-full ${config.progressBg} toast-progress origin-left rounded-r-full`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationProduct;
