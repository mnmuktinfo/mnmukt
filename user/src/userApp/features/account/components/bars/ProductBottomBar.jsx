import React from "react";
import { ShoppingBag, Loader2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   ProductBottomBar — Streetwear / Modern E-commerce Edition
   Aesthetic: Bold typography, sharp edges, high contrast
   Mobile-only sticky bottom bar
───────────────────────────────────────────────────────────── */

const STYLES = `
  .pbb-slide-up {
    animation: pbbSlideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  @keyframes pbbSlideUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
`;

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const ProductBottomBar = ({ product, handleAddToCart, isAdding }) => {
  if (!product) return null;

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const saving = product.originalPrice - product.price;
  const isOutOfStock = product.stock === 0;

  return (
    <>
      <style>{STYLES}</style>

      {/* Sticky Bottom Bar Container */}
      <div
        className="pbb-slide-up md:hidden fixed bottom-0 left-0 right-0 z-100 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] font-sans"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
        {/* Main Content Area */}
        <div className="flex items-center justify-between p-3 gap-4">
          {/* LEFT: Price Block */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-end gap-2 flex-wrap">
              <span className="text-xl font-bold text-gray-900 leading-none tracking-tight">
                {fmt(product.price)}
              </span>
              {discount > 0 && (
                <span className="text-xs font-medium text-gray-400 line-through leading-none mb-0.5">
                  {fmt(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {discount > 0 && (
                <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 leading-none">
                  {discount}% OFF
                </span>
              )}
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Incl. Taxes
              </span>
            </div>
          </div>

          {/* RIGHT: CTA Button */}
          <div className="flex-1 min-w-[140px]">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={`
                relative w-full h-12 flex items-center justify-center gap-2 
                text-sm font-bold tracking-widest uppercase transition-all duration-200 
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-500 border-2 border-gray-300"
                    : "bg-[#e11b22] text-white hover:bg-red-700 border-2 border-[#e11b22] hover:border-red-700"
                }
              `}>
              {isAdding ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  <span>{isOutOfStock ? "SOLD OUT" : "ADD TO CART"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductBottomBar;
