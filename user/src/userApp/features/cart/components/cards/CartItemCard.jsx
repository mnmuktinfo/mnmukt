import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import QuantityPopup from "../../../../components/pop-up/QuantityPopup";
import SizePopup from "../../../../components/pop-up/SizePopup";
import { ChevronDown, Trash2, Heart, Truck } from "lucide-react";

const CartItemCard = ({
  product,
  onRemove,
  onSelect,
  selected,
  onQtyChange,
  onSizeChange,
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

  // Price calculations
  const price = Number(product.price);
  const mrp = Number(product.mrp || product.originalPrice || product.price);
  const hasDiscount = mrp > price;

  // Safe check for sizes array
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleQuantityChange = (val) => {
    setQuantity((prev) => {
      let newQty = prev;

      if (val === "increment") newQty = prev + 1;
      else if (val === "decrement" && prev > 1) newQty = prev - 1;
      else if (typeof val === "number" && val > 0) newQty = val;

      if (newQty !== prev && onQtyChange) {
        onQtyChange(newQty);
      }

      return newQty;
    });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    if (onSizeChange) {
      onSizeChange(size);
    }
    setShowSizePopup(false);
  };

  // Mock a delivery date (e.g., 4 days from now) for UI realism
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDelivery = deliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="w-full bg-white sm:rounded-md sm:border border-gray-200 flex flex-col font-sans shadow-sm">
      {/* --- TOP SECTION: Checkbox, Image, Info --- */}
      <div className="p-3 sm:p-4 flex items-start gap-3">
        {/* 1. Checkbox */}
        <div className="pt-8 shrink-0">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-[18px] h-[18px] sm:w-5 sm:h-5 accent-[#f43397] cursor-pointer rounded-sm border-gray-300"
          />
        </div>

        {/* 2. Product Image */}
        <Link to={`/product/${product.slug}`} className="shrink-0 block">
          <img
            src={product.banner}
            alt={product.name}
            className="w-[76px] h-[96px] sm:w-[90px] sm:h-[114px] object-cover rounded border border-gray-100 bg-gray-50"
          />
        </Link>

        {/* 3. Product Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Link to={`/product/${product.slug}`}>
            <h3
              title={product.name}
              className="text-[13px] sm:text-[14px] font-medium text-gray-800 leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Seller / Brand Info */}
          <p className="text-[11px] text-gray-500 mt-1 truncate">
            Sold by: <span className="font-medium text-gray-700">Mnmukt</span>
          </p>

          {/* Pricing */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-2">
            <span className="text-[16px] sm:text-[18px] font-bold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[12px] text-gray-400 line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
                <span className="text-[12px] font-bold text-[#f43397] ml-1">
                  {Math.round(((mrp - price) / mrp) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Selectors: Size & Qty Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {hasSizes ? (
              <button
                onClick={() => setShowSizePopup(true)}
                className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] sm:text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Size:{" "}
                <span className="font-bold text-gray-900">
                  {selectedSize || "Select"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
            ) : (
              <div className="flex items-center px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] sm:text-[12px] font-medium text-gray-500">
                Size: <span className="ml-1 text-gray-700">Free Size</span>
              </div>
            )}

            <button
              onClick={() => setShowQuantityPopup(true)}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] sm:text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Qty:{" "}
              <span className="font-bold text-gray-900">
                {selectedQuantity}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* Trust Badges (Meesho Style) */}
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-600 font-medium">
              <Heart size={12} className="text-gray-400" />
              14 days return available
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-600 font-medium">
              <Truck size={12} className="text-[#038d63]" />
              Delivery by{" "}
              <span className="font-bold text-gray-800">
                {formattedDelivery}
              </span>
              <span className="text-gray-300 mx-0.5">|</span>
              <span className="text-[#038d63] font-bold">FREE</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: Action Buttons --- */}
      <div className="flex items-center border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onRemove}
          className="flex-1 flex justify-center items-center gap-1.5 py-3 sm:py-3.5 text-[12px] font-bold text-gray-600 uppercase tracking-wide hover:bg-gray-100 transition-colors">
          <Trash2 className="w-4 h-4 text-gray-400" />
          Remove
        </button>

        <div className="w-[1px] h-6 bg-gray-200"></div>

        <button className="flex-1 flex justify-center items-center gap-1.5 py-3 sm:py-3.5 text-[12px] font-bold text-gray-600 uppercase tracking-wide hover:bg-gray-100 transition-colors">
          <Heart className="w-4 h-4 text-gray-400" />
          Wishlist
        </button>
      </div>

      {/* --- POPUPS --- */}
      {showQuantityPopup && (
        <QuantityPopup
          quantity={selectedQuantity}
          handleQuantityChange={handleQuantityChange}
          stock={product.qty || 10}
          onClose={() => setShowQuantityPopup(false)}
        />
      )}

      {showSizePopup && hasSizes && (
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
