import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import QuantityPopup from "../../../../components/pop-up/QuantityPopup";
import SizePopup from "../../../../components/pop-up/SizePopup";
import { ChevronDown, Info, X, Check } from "lucide-react";

const CartItemCard = ({
  product,
  onRemove,
  onSelect,
  selected,
  onQtyChange,
  onSizeChange,
}) => {
  // Use local state for UI, but always sync with cart context
  const [selectedQuantity, setQuantity] = useState(
    product.selectedQuantity || 1,
  );
  const [selectedSize, setSelectedSize] = useState(product.selectedSize || "");
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);

  useEffect(() => {
    setQuantity(product.selectedQuantity || 1); // sync with context updates
    setSelectedSize(product.selectedSize || "");
  }, [product.selectedQuantity, product.selectedSize]);

  const price = Number(product.price);
  const originalPrice = Number(product.originalPrice);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Handle quantity changes
  const handleQuantityChange = (action) => {
    setQuantity((prev) => {
      let newQty = prev;
      if (action === "increment") newQty = prev + 1;
      else if (action === "decrement" && prev > 1) newQty = prev - 1;

      if (onQtyChange) onQtyChange(newQty); // update context / IndexedDB

      return newQty;
    });
  };

  // Handle size selection
  const handleSizeChange = (size) => {
    setSelectedSize(size); // local UI
    if (onSizeChange) onSizeChange(size); // update context / IndexedDB
  };

  return (
    <div className="bg-white w-full md:max-w-2xl rounded-lg shadow-sm p-4 flex gap-4 relative">
      {/* Remove Button */}
      <button
        onClick={() => onRemove(product.id)}
        className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition">
        <X size={16} />
      </button>

      {/* IMAGE */}
      <div className="relative min-w-[20]">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.banner}
            alt={product.name}
            className="w-30 h-35 object-cover rounded"
          />
        </Link>
        {/* Select Tick Button */}
        <button
          onClick={() => onSelect(product)}
          className="flex absolute top-1 left-1 items-center gap-1 px-2 py-1 uppercase transition">
          <Check
            size={18}
            className={`p-0.5 text-white rounded-sm border transition-colors ${
              selected
                ? "bg-[#ff356c] text-white border-none font-bold"
                : "bg-white border border-gray-400 text-2xl"
            }`}
          />
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex-1 flex flex-col justify-between">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-xs text-gray-800 leading-tight line-clamp-2 hover:text-[#FF3F6C] transition">
            {product.name}
          </h3>
        </Link>

        <div className="mt-0 md:mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">₹{price}</span>
          {originalPrice > price && (
            <>
              <span className="line-through text-xs text-gray-500">
                ₹{originalPrice}
              </span>
              <span className="text-orange-500 text-xs">({discount}% OFF)</span>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-1">
          {/* Quantity Button */}
          <button
            onClick={() => setShowQuantityPopup(true)}
            className="flex items-center gap-1 px-2 py-1 font-semibold text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Qty: {selectedQuantity}
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Size Button */}
          <button
            onClick={() => setShowSizePopup(true)}
            className="flex items-center gap-1 px-2 py-1 font-semibold text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
            Size: {selectedSize || "Select"}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
          <Info className="w-4 h-4" />
          14 days return available
        </p>

        {/* Popups */}
        {showQuantityPopup && (
          <QuantityPopup
            quantity={selectedQuantity}
            handleQuantityChange={handleQuantityChange}
            stock={product.qty || 10}
            onClose={() => setShowQuantityPopup(false)}
          />
        )}
        {showSizePopup && (
          <SizePopup
            sizes={product.sizes}
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
            onClose={() => setShowSizePopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CartItemCard;
