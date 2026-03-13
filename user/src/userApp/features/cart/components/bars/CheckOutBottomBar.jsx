import React from "react";

const CheckOutBottomBar = ({ selectedItems, totalPrice, onPlaceOrder }) => {
  const selectedCount = selectedItems.length;

  if (selectedCount === 0) return null; // hide if nothing is selected

  return (
    <div className="fixed bottom-0 z-[60] left-0 w-full bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-gray-200 px-4 py-3 flex justify-between items-center lg:hidden">
      {/* Selected items info */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {selectedCount} Item{selectedCount > 1 ? "s" : ""} Selected
        </span>
        <span className="text-lg font-bold text-gray-900">
          ₹ {totalPrice.toFixed(2)}
        </span>
      </div>

      {/* Place Order button */}
      <button
        onClick={onPlaceOrder}
        className="bg-[#007673] text-white text-[13px] font-bold uppercase tracking-wide py-3 px-8 rounded-sm shadow-sm hover:bg-[#005f5c] transition-colors">
        Place Order
      </button>
    </div>
  );
};

export default CheckOutBottomBar;
