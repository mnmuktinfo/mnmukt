import React from "react";

const UnitSelector = ({ prices, selectedUnit, onUnitSelect }) => {
  if (!prices || prices.length <= 1) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Unit</h3>
      <div className="flex flex-wrap gap-2">
        {prices.map((p) => (
          <button
            key={p.unit}
            onClick={() => onUnitSelect(p.unit)}
            className={`border-2 rounded-lg px-3 py-2 font-medium transition-colors duration-200 shadow-sm text-sm md:text-base
              ${
                selectedUnit === p.unit
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
              }`}>
            {p.unit} - ₹{p.price.toFixed(2)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UnitSelector;
