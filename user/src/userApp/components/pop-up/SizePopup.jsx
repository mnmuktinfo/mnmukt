import React from "react";
import { X } from "lucide-react";
import SizeSelector from "../selector/SizeSelector";

const SizePopup = ({ sizes = [], selectedSize, onSizeChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-72 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded-full transition">
          <X size={18} />
        </button>

        {sizes.length > 0 && (
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSizeChange={onSizeChange}
          />
        )}
      </div>
    </div>
  );
};

export default SizePopup;
