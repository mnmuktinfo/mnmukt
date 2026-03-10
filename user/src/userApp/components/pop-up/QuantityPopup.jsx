import React from "react";
import { X } from "lucide-react";
import { QuantitySelector } from "../product/QuantitySelector";

const QuantityPopup = ({ quantity, handleQuantityChange, stock, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-80 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded-full transition">
          <X size={20} />
        </button>

        <QuantitySelector
          quantity={quantity}
          handleQuantityChange={handleQuantityChange}
          stock={stock}
        />
      </div>
    </div>
  );
};

export default QuantityPopup;
