import React from "react";
import { Plus, Minus } from "lucide-react";

const QuantitySelector = ({
  quantity,
  handleQuantityChange, // Match the prop name passed from parent
  stock = 10,
}) => {
  const decrease = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < stock) {
      handleQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center border border-gray-200 rounded-full w-fit bg-gray-50/50">
      {/* Decrease Button */}
      <button
        onClick={decrease}
        disabled={quantity <= 1}
        className={`
          w-10 h-10 flex items-center justify-center rounded-l-full transition-colors
          ${
            quantity <= 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-900 hover:bg-gray-200"
          }
        `}>
        <Minus size={16} strokeWidth={2} />
      </button>

      {/* Number Display */}
      <span className="w-10 text-center text-sm font-bold text-gray-900 selection:bg-transparent">
        {quantity}
      </span>

      {/* Increase Button */}
      <button
        onClick={increase}
        disabled={quantity >= stock}
        className={`
          w-10 h-10 flex items-center justify-center rounded-r-full transition-colors
          ${
            quantity >= stock
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-900 hover:bg-gray-200"
          }
        `}>
        <Plus size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

export default QuantitySelector;
