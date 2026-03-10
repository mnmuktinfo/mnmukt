import React from "react";
import { ShoppingBag } from "lucide-react";
import CustomButton from "../../../../components/button/CustomButton";

const ProductBottomBar = ({ product, handleAddToCart, isAdding }) => {
  if (!product) return null;

  // Price formatting helper
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-slide-up">
      <div className="flex items-center justify-between gap-4">
        {/* 1. LEFT: Price Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through decoration-gray-400">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Subtext or Discount */}
          {discount > 0 ? (
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
              {discount}% Discount
            </span>
          ) : (
            <span className="text-[10px] text-gray-500 font-medium">
              Inclusive of all taxes
            </span>
          )}
        </div>

        {/* 2. RIGHT: Add to Bag Action */}
        <div className="flex-1 max-w-[200px]">
          <CustomButton
            text={isAdding ? "Adding..." : "Add to Bag"}
            icon={<ShoppingBag size={18} strokeWidth={2.5} />}
            loading={isAdding}
            onClick={handleAddToCart}
            className="h-12 w-full text-xs font-bold uppercase tracking-widest  shadow-gray-200"
            bgColor="#111827" // Gray-900 (Black)
            textColor="#ffffff"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductBottomBar;
