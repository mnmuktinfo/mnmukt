import React from "react";

const QuantitySelector = ({ quantity, setQuantity }) => {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-lg font-medium text-gray-800">Quantity:</span>
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="w-10 h-10 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-100 transition"
          disabled={quantity <= 1}>
          -
        </button>
        <span className="w-12 text-center text-lg font-semibold text-gray-800">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((prev) => prev + 1)}
          className="w-10 h-10 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-100 transition">
          +
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
