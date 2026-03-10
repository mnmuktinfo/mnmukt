import React from "react";
import { Trash2 } from "lucide-react";

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="flex gap-5 border-b pb-5">
      <img
        src={item.image}
        alt={item.name}
        className="w-24 h-28 object-cover rounded-lg"
      />

      <div className="flex-1">
        <h3 className="text-sm font-medium">{item.name}</h3>
        <p className="text-gray-500 text-sm mt-1">Size: {item.unit}</p>

        <p className="text-lg font-semibold mt-2">₹ {item.price}</p>

        <div className="flex items-center gap-3 mt-4">
          {/* Quantity */}
          <button
            className="border px-2 rounded"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}>
            -
          </button>

          <span className="font-medium">{item.quantity}</span>

          <button
            className="border px-2 rounded"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}>
            +
          </button>

          {/* Remove */}
          <button
            className="ml-auto text-red-500 hover:text-red-600"
            onClick={() => onRemove(item.id)}>
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
