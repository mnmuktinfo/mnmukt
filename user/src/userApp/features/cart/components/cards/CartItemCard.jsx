import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import QuantityPopup from "../../../../components/pop-up/QuantityPopup";
import SizePopup from "../../../../components/pop-up/SizePopup";
import { ChevronDown } from "lucide-react";

const CartItemCard = ({
  product,
  onRemove,
  onSelect,
  selected,
  onQtyChange, // from CartPage -> updateQuantity
  onSizeChange, // from CartPage -> updateSize
}) => {
  // Local state for UI
  const [selectedQuantity, setQuantity] = useState(
    product.selectedQuantity || 1,
  );
  const [selectedSize, setSelectedSize] = useState(product.selectedSize || "");
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);

  // Sync local state with props when cart changes
  useEffect(() => {
    setQuantity(product.selectedQuantity || 1);
    setSelectedSize(product.selectedSize || "");
  }, [product.selectedQuantity, product.selectedSize]);

  const price = Number(product.price);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleQuantityChange = (action) => {
    setQuantity((prev) => {
      let newQty = prev;

      if (action === "increment") newQty = prev + 1;
      else if (action === "decrement" && prev > 1) newQty = prev - 1;

      if (newQty !== prev && onQtyChange) {
        // Sync with CartContext
        onQtyChange(newQty);
      }

      return newQty;
    });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    if (onSizeChange) {
      // Sync with CartContext
      onSizeChange(size);
    }
  };

  return (
    <div className="w-full bg-white flex flex-col">
      {/* Top Section: Checkbox, Image, Info, Price */}
      <div className="flex items-start gap-4">
        {/* 1. Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(product)}
            className="w-[18px] h-[18px] accent-[#007673] cursor-pointer rounded-sm border-gray-300"
          />
        </div>

        {/* 2. Product Image */}
        <Link to={`/product/${product.slug}`} className="shrink-0">
          <img
            src={product.banner}
            alt={product.name}
            className="w-[90px] h-[110px] object-cover rounded-sm border border-gray-100 shadow-sm"
          />
        </Link>

        {/* 3. Product Details & Dropdowns */}
        <div className="flex-1 flex flex-col min-w-0">
          <Link to={`/product/${product.slug}`}>
            <h3
              title={product.name}
              className="text-[13px] font-medium text-gray-800 leading-tight line-clamp-2 hover:text-[#007673] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[12px] text-gray-400 mt-1">
            {product.category || "Shirts"}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {/* Size Dropdown */}
            <button
              onClick={() => setShowSizePopup(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-sm text-[12px] font-medium text-gray-700 hover:border-gray-400 transition-colors bg-white shadow-sm">
              Size:{" "}
              <span className="font-bold text-gray-900">
                {selectedSize || "Select"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Quantity Dropdown */}
            <button
              onClick={() => setShowQuantityPopup(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-sm text-[12px] font-medium text-gray-700 hover:border-gray-400 transition-colors bg-white shadow-sm">
              Qty:{" "}
              <span className="font-bold text-gray-900">
                {selectedQuantity}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 4. Price */}
        <div className="text-right shrink-0 min-w-[100px]">
          <span className="text-[14px] font-bold text-gray-900 block">
            ₹ {price}
          </span>
          <span className="text-[10px] font-medium text-gray-400 block mt-0.5 tracking-wide">
            MRP incl. of all taxes
          </span>
        </div>
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="mt-5 pt-4 flex justify-end gap-3 w-full">
        <button
          onClick={() => onRemove(product.id)}
          className="px-5 py-2 border border-gray-200 rounded-sm text-[11px] font-bold text-gray-600 uppercase tracking-wider hover:border-gray-300 hover:text-gray-800 transition-colors">
          Remove
        </button>
        <button className="px-5 py-2 border border-gray-200 rounded-sm text-[11px] font-bold text-gray-600 uppercase tracking-wider hover:border-gray-300 hover:text-gray-800 transition-colors">
          Move to Wishlist
        </button>
      </div>

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
  );
};

export default CartItemCard;
