import React from "react";
import { Check } from "lucide-react";

const CartControlHeader = ({
  cartItems,
  selectedItems,
  onToggleSelect,
  onClearCart,
  totalPrice,
}) => {
  const allSelected =
    selectedItems.length === cartItems.length && cartItems.length > 0;

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-gray-100 w-full rounded-t-sm">
      {/* Left side: Checkbox + Selection Count + Price */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={onToggleSelect}>
        {/* Custom Teal Checkbox */}
        <div
          className={`w-[18px] h-[18px] flex items-center justify-center rounded-sm border transition-colors ${
            allSelected
              ? "bg-[#007673] border-[#007673]"
              : "bg-white border-gray-300"
          }`}>
          {allSelected && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </div>

        {/* Text Label */}
        <span className="text-[12px] font-bold text-gray-700 tracking-wide uppercase flex items-center">
          {selectedItems.length}/{cartItems.length} Items Selected
          {selectedItems.length > 0 && (
            <span className="text-[#007673] ml-1">(₹ {totalPrice})</span>
          )}
        </span>
      </div>

      {/* Right side: Clear Cart (Text-based to match the clean aesthetic) */}
      {cartItems.length > 0 && (
        <button
          onClick={onClearCart}
          className="text-[11px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors">
          Clear
        </button>
      )}
    </div>
  );
};

export default CartControlHeader;
