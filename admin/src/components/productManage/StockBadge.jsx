import React from "react";

const StockBadge = ({ stock }) => {
  if (stock === 0)
    return (
      <span className="bg-red-100 text-red-700 px-2 py-1 text-xs rounded-sm">
        Out of Stock
      </span>
    );
  if (stock <= 10)
    return (
      <span className="bg-amber-100 text-amber-700 px-2 py-1 text-xs rounded-sm">
        Low — {stock} left
      </span>
    );
  return (
    <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-sm">
      {stock} in stock
    </span>
  );
};

export default StockBadge;
