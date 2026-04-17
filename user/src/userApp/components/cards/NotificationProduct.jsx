import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  X,
  AlertCircle,
  ShoppingBag,
  Heart,
  Tag,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   NotificationProduct — Premium Pink Theme (Sharp/No-Radius)
   Features: Top-positioned, sharp edges, slide-down animation
───────────────────────────────────────────────────────────── */

const STYLES = `
 .toast-progress {
    animation: toastDrain var(--duration) linear forwards;
    animation-play-state: running;
  }
 .toast-paused .toast-progress {
    animation-play-state: paused;
  }
  @keyframes toastDrain {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Unified around a vibrant pink palette
const CONFIG = {
  success: {
    icon: CheckCircle2,
    accentText: "text-pink-600",
    accentBg: "bg-pink-50",
    progressBg: "bg-pink-500",
    label: "Success",
  },
  error: {
    icon: AlertCircle,
    accentText: "text-rose-600",
    accentBg: "bg-rose-50",
    progressBg: "bg-rose-500",
    label: "Failed",
  },
  cart: {
    icon: ShoppingBag,
    accentText: "text-[#e6007e]", // Punchy brand pink
    accentBg: "bg-[#fdf2f8]", // Soft pink background
    progressBg: "bg-gradient-to-r from-pink-400 to-[#e6007e]",
    label: "Added to Bag",
  },
  wishlist: {
    icon: Heart,
    accentText: "text-[#e6007e]",
    accentBg: "bg-[#fdf2f8]",
    progressBg: "bg-gradient-to-r from-pink-400 to-[#e6007e]",
    label: "Saved to Wishlist",
  },
  promo: {
    icon: Tag,
    accentText: "text-fuchsia-600",
    accentBg: "bg-fuchsia-50",
    progressBg: "bg-fuchsia-500",
    label: "Offer Applied",
  },
};

const NotificationProduct = ({
  message = "Item processed successfully.",
  type = "cart",
  onClose,
  duration = 3500,
  product = null, // {img, name, price}
  cta = null, // {label, onClick}
  index = 0, // for stacking
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);

  const config = CONFIG[type] || CONFIG.cart;
  const Icon = config.icon;

  const startTimer = (time) => {
    clearTimeout(timerRef.current);
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, time);
  };

  useEffect(() => {
    requestAnimationFrame(() => setIsShowing(true));
    startTimer(duration);

    // Subtle haptic for mobile
    if (navigator.vibrate && (type === "cart" || type === "wishlist")) {
      navigator.vibrate(10);
    }

    return () => clearTimeout(timerRef.current);
  }, []);

  const handleClose = () => {
    setIsShowing(false);
    setTimeout(onClose, 300); // Wait for transition before unmounting
  };

  const handleMouseEnter = () => {
    if (isPaused) return;
    setIsPaused(true);
    clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = remainingTimeRef.current - elapsed;
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimer(remainingTimeRef.current);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        // Changed to top-0 flush on mobile, top-6 right-6 on desktop
        className="fixed z-[10000] top-0 left-0 right-0 md:top-6 md:left-auto md:right-6 md:w-[400px] flex justify-center pointer-events-none"
        style={{
          // Stack downwards instead of upwards since we are at the top
          transform: `translateY(${index * 96}px)`,
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}
        role="alert"
        aria-live="polite">
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          // Removed all rounded corners, added sharp borders, changed animation to slide DOWN
          className={`pointer-events-auto w-full bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(230,0,126,0.20)] border-b md:border border-pink-100 overflow-hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-none ${
            isPaused ? "toast-paused" : ""
          } ${
            isShowing
              ? "translate-y-0 opacity-100"
              : "-translate-y-full md:-translate-y-8 opacity-0"
          }`}>
          <div className="flex items-start p-4 md:p-5">
            {/* Product Thumb or Icon (Sharp Edges) */}
            {product?.img ? (
              <img
                src={product.img}
                alt={product.name || "Product"}
                // Removed rounded-lg
                className="flex-shrink-0 w-14 h-16 object-cover border border-pink-50 mr-4 rounded-none shadow-sm"
              />
            ) : (
              <div
                // Removed rounded-full, made it a sharp square box
                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-none ${config.accentBg} ${config.accentText} mr-4 border border-pink-50`}>
                <Icon size={22} strokeWidth={2} />
              </div>
            )}

            {/* Text Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p
                className={`text-[11px] font-bold tracking-widest uppercase ${config.accentText} mb-1 opacity-90`}>
                {config.label}
              </p>
              <p className="text-[14px] font-medium text-gray-800 leading-snug line-clamp-2">
                {message}
              </p>

              {product?.price && (
                <p className="text-[14px] font-bold text-gray-900 mt-1.5">
                  ₹{product.price}
                </p>
              )}

              {cta && (
                <button
                  onClick={() => {
                    cta.onClick();
                    handleClose();
                  }}
                  className={`mt-2.5 text-[12px] uppercase tracking-wider font-bold ${config.accentText} hover:text-pink-800 transition-colors inline-flex items-center gap-1 group`}>
                  {cta.label}
                  <span className="transform transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              )}
            </div>

            {/* Close Button (Sharp hover state) */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-3 p-2 text-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors active:scale-95 rounded-none"
              aria-label="Close notification">
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Progress Bar (Attached to bottom edge of the sharp container) */}
          <div className="w-full h-[3px] bg-pink-50">
            <div
              style={{ "--duration": `${remainingTimeRef.current}ms` }}
              className={`h-full ${config.progressBg} toast-progress origin-left`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationProduct;
