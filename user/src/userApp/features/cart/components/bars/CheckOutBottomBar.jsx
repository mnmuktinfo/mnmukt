import React, { memo } from "react";
import { Loader2, ChevronUp } from "lucide-react";

const CheckOutBottomBar = ({
  itemCount = 0,
  totalPrice = 0,
  originalPrice = 0, // Pass this to show strikethrough MRP savings
  buttonText = "Continue",
  onPlaceOrder,
  disabled = false,
  loading = false,
  onPriceClick, // Optional: Pass a function to open a price breakdown bottom sheet
}) => {
  // Do not render if there's no data (or handle it via disabled state based on preference)
  if (itemCount === 0 && totalPrice === 0) return null;

  const hasDiscount = originalPrice > totalPrice;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 lg:hidden pb-safe">
      <div className="flex items-center justify-between p-3 sm:px-4 gap-4">
        {/* --- LEFT SIDE: Price Information --- */}
        <div
          className={`flex flex-col flex-1 ${onPriceClick ? "cursor-pointer" : ""}`}
          onClick={onPriceClick}>
          {/* Label */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Total Amount
            </span>
            {onPriceClick && <ChevronUp size={14} className="text-gray-400" />}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[18px] font-bold text-gray-900">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>

            {hasDiscount && (
              <span className="text-[12px] text-gray-400 line-through font-medium">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Subtle Item Count or Savings */}
          {hasDiscount ? (
            <span className="text-[10px] font-bold text-[#038d63] mt-0.5">
              Save ₹{(originalPrice - totalPrice).toLocaleString("en-IN")}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium mt-0.5">
              For {itemCount} item{itemCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* --- RIGHT SIDE: Action Button --- */}
        <div className="flex-shrink-0 w-[55%] sm:w-[60%]">
          <button
            onClick={onPlaceOrder}
            disabled={disabled || loading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md text-[14px] font-bold tracking-wide transition-all duration-200 shadow-sm
              ${
                disabled || loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#f43397] hover:bg-[#d82a85] active:scale-[0.98] text-white"
              }
            `}>
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(CheckOutBottomBar);
