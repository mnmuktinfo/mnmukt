import { Minus, Plus } from "lucide-react";

export const QuantitySelector = ({ quantity, handleQuantityChange, stock }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">Quantity</label>
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-gray-300 rounded-lg">
        <button
          onClick={() => handleQuantityChange("decrement")}
          className="p-2 hover:bg-gray-100 transition-colors"
          disabled={quantity <= 1}>
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 text-lg font-medium min-w-12 text-center">
          {quantity}
        </span>
        <button
          onClick={() => handleQuantityChange("increment")}
          className="p-2 hover:bg-gray-100 transition-colors"
          disabled={quantity >= stock}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <span className="text-sm text-gray-500">
        {stock - quantity} available
      </span>
    </div>
  </div>
);
