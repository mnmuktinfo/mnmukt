import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const SalesNotification = ({
  buyerLocation = "new", // "new" as seen in the screenshot (likely meant to be "New York" or similar)
  productName = "Rose Gold Earrings",
  timeAgo = "2 Minutes ago",
  imageSrc = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200", // Placeholder for earrings
  duration = 5000, // Auto-hide after 5 seconds (optional)
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Optional: Auto-close the notification after a set duration
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-start p-4 pr-10 bg-white rounded-[10px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 max-w-[340px] animate-in slide-in-from-bottom-8 fade-in duration-500 font-sans">
      {/* Product Image Container */}
      <div className="flex-shrink-0 w-[84px] h-[84px] border border-gray-200 rounded-lg p-1.5 mr-4 bg-white">
        <img
          src={imageSrc}
          alt={productName}
          className="w-full h-full object-contain rounded-md"
        />
      </div>

      {/* Text Content */}
      <div className="flex flex-col justify-center h-full pt-0.5">
        <p className="text-[14px] text-gray-500 leading-tight">
          Someone in {buyerLocation} just
          <br />
          bought
        </p>

        <p className="text-[16px] font-bold text-[#333333] mt-1.5 mb-1 tracking-tight">
          {productName}
        </p>

        <p className="text-[13px] text-gray-500">{timeAgo}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors bg-white rounded-full p-0.5"
        aria-label="Close notification">
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default SalesNotification;
