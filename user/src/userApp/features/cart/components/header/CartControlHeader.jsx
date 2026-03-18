import React, { memo, useMemo } from "react";
import { Check } from "lucide-react";

const CartControlHeader = ({
  cartItems = [],
  selectedItems = [],
  onToggleSelect,
  onClearCart,
  totalPrice = 0,
}) => {
  const allSelected = useMemo(
    () => selectedItems.length === cartItems.length && cartItems.length > 0,
    [selectedItems.length, cartItems.length],
  );

  const handleClear = (e) => {
    e.stopPropagation();
    onClearCart();
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 w-full rounded-t-sm shadow-sm border-b border-gray-100">
      {/* Left: Select All */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={onToggleSelect}>
        <div
          className={`w-[18px] h-[18px] flex items-center justify-center rounded-sm border transition-colors ${
            allSelected
              ? "bg-[#f43397] border-[#f43397]"
              : "bg-white border-gray-300"
          }`}>
          {allSelected && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </div>

        <span className="text-[12px] font-bold text-gray-700 tracking-wide uppercase flex items-center">
          {selectedItems.length}/{cartItems.length} Items Selected
          {selectedItems.length > 0 && (
            <span className="text-[#f43397] ml-1">
              (₹ {totalPrice.toLocaleString("en-IN")})
            </span>
          )}
        </span>
      </div>

      {/* Right: Clear Cart */}
      {cartItems.length > 0 && (
        <button
          onClick={handleClear}
          className="text-[11px] font-bold text-gray-400 hover:text-[#f43397] uppercase tracking-widest transition-colors">
          Clear
        </button>
      )}
    </div>
  );
};

export default memo(CartControlHeader);
