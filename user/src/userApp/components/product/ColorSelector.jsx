import React from "react";
import { Check } from "lucide-react";

const ColorSelector = ({ colors, selectedColor, onColorChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Color</label>
      <div className="flex flex-wrap gap-3">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => onColorChange(color)}
            className={`relative w-12 h-12 rounded-full border-2 transition-all ${
              selectedColor?.name === color.name
                ? "border-[#B4292F] ring-2 ring-[#B4292F]/20"
                : "border-gray-300 hover:border-gray-400"
            }`}
            style={{
              backgroundImage: `url(${color.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            title={color.name}>
            {selectedColor?.name === color.name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        ))}
      </div>
      {selectedColor && (
        <p className="text-sm text-gray-600">Selected: {selectedColor.name}</p>
      )}
    </div>
  );
};

export default ColorSelector;
