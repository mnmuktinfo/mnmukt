import React from "react";
import { Check, Trash2 } from "lucide-react";

const CartControlHeader = ({
  cartItems,
  selectedItems,
  onToggleSelect,
  onClearCart,
  totalPrice,
}) => {
  // console.log(selectedItems);
  const allSelected =
    selectedItems.length === cartItems.length && cartItems.length > 0;

  return (
    <div className="flex md:max-w-2xl items-center justify-between bg-gray-100 p-2 rounded mb-2 gap-2 text-sm">
      {/* Select All */}
      <button
        onClick={onToggleSelect}
        className="flex items-center gap-2 px-2 py-1 uppercase transition">
        <div
          className={`w-5 h-5 flex items-center justify-center rounded-sm border transition
          ${
            allSelected
              ? "bg-[#ff356c] border-none"
              : "bg-white border-gray-400"
          }`}>
          {allSelected && <Check size={14} className="text-white" />}
        </div>
        {selectedItems.length}/{cartItems.length} Selected
      </button>

      {/* Clear Cart */}
      <button
        onClick={onClearCart}
        className="flex items-center hover:bg-gray-200 px-2 py-1 rounded transition">
        <Trash2 size={17} />
      </button>

      {/* Total */}
      <div className="px-2 py-1 font-semibold">Total: ₹{totalPrice}</div>
    </div>
  );
};

export default CartControlHeader;
