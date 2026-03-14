import React from "react";
import { ShoppingBag, Loader2 } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const ProductBottomBar = ({ product, handleAddToCart, isAdding }) => {
  if (!product) return null;

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price);

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] font-sans pb-safe">
      <div className="flex items-center justify-between px-4 py-3 gap-5">
        {/* ── LEFT: Minimalist Price Block ── */}
        <div className="flex flex-col justify-center shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[18px] font-bold text-gray-900">
              {fmt(price)}
            </span>
            {discount > 0 && (
              <span className="text-[12px] font-medium text-gray-400 line-through">
                {fmt(originalPrice)}
              </span>
            )}
          </div>

          {discount > 0 ? (
            <span className="text-[11px] font-bold text-[#ff3f6c] tracking-wide mt-0.5">
              {discount}% OFF
            </span>
          ) : (
            <span className="text-[10px] font-medium text-gray-500 mt-0.5">
              Inclusive of all taxes
            </span>
          )}
        </div>

        {/* ── RIGHT: Solid CTA Button ── */}
        <div className="flex-1">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`w-full h-[48px] flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-[0.15em] rounded-md transition-all duration-200 active:scale-[0.98]
              ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#ff3f6c] text-white hover:bg-[#e0355f] shadow-sm shadow-[#ff3f6c]/25"
              }
            `}>
            {isAdding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <ShoppingBag size={18} strokeWidth={2.5} className="-mt-0.5" />
                <span>{isOutOfStock ? "SOLD OUT" : "ADD TO BAG"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductBottomBar;
