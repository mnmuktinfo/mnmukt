import React, { useMemo } from "react";
import {
  ShoppingBag,
  ShieldCheck,
  Heart,
  Hash,
  RefreshCcw,
  Ruler,
  ChevronRight,
  Info,
  Lock,
  Zap,
} from "lucide-react";
import { TrustBadges } from "../badges/TrustBadges";
import { ShareSection } from "../section/ShareSectionNew";
import QuantitySelector from "../../../components/unit/QuantitySelector";
import { PriceInfo } from "./PriceInfo";
import SizeSelector from "../selector/SizeSelector";

const ProductInfo = ({
  product,
  discount,
  renderStars,
  formatPrice,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  handleAddToCart,
  handleWishlistToggle,
  isWishlisted,
  isAdding,
}) => {
  const isLowStock = useMemo(
    () => product.stock > 0 && product.stock < 5,
    [product.stock],
  );

  return (
    <div className="space-y-10 md:space-y-12 font-sans animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* 1. IDENTITY BLOCK */}
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-slate-950 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-[0.2em]">
                Limited Edition
              </span>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff356c]">
                Authorized Archive
              </p>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-950 leading-[0.95]">
              {product.name}
              <span className="text-[#ff356c] italic font-serif">.</span>
            </h1>
          </div>

          <button
            onClick={handleWishlistToggle}
            className={`group p-4 md:p-5 border transition-all duration-500 active:scale-90 ${
              isWishlisted
                ? "bg-slate-950 border-slate-950 text-[#ff356c] shadow-2xl"
                : "bg-white border-slate-100 text-slate-300 hover:border-slate-950 hover:text-slate-950"
            }`}>
            <Heart
              size={20}
              fill={isWishlisted ? "currentColor" : "none"}
              className="transition-transform duration-500 group-hover:scale-110"
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* METADATA HUD */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white bg-slate-100"
                />
              ))}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 border-b border-[#ff356c]/30">
              {product.reviewsCount || "142"} Authenticated Reviews
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <Hash className="w-3 h-3 text-[#ff356c]" />
            {product.sku || "MN-9921-X"}
          </div>
        </div>

        <div className="pt-4">
          <PriceInfo
            product={product}
            discount={discount}
            formatPrice={formatPrice}
          />
        </div>
      </section>

      <div className="h-px bg-slate-100 w-full" />

      {/* 2. CONFIGURATION ENGINE */}
      <section className="space-y-10">
        {/* Size Interface */}
        {product.sizes?.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950">
                Dimension Protocol
              </span>
              <button className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-[#ff356c] transition-colors group">
                <Ruler
                  size={13}
                  className="group-hover:rotate-45 transition-transform duration-500"
                />
                Size Guide
              </button>
            </div>
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />
          </div>
        )}

        {/* Stock & Volume HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50 p-5 border border-slate-100 rounded-sm">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 block">
              Unit Acquisition
            </label>
            <QuantitySelector
              quantity={quantity}
              handleQuantityChange={setQuantity}
              stock={product.stock || 10}
            />
          </div>

          {isLowStock ? (
            <div className="flex items-center gap-3 text-[#ff356c] sm:text-right">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff356c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff356c]"></span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Scarcity Alert
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  Only {product.stock} pieces remaining
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Inventory Verified
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. AUTHORIZATION CORE */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col gap-4">
          <button
            disabled={isAdding}
            onClick={handleAddToCart}
            className="group relative overflow-hidden w-full bg-slate-950 text-white py-6 md:py-7 text-[11px] font-black uppercase tracking-[0.5em] transition-all duration-500 disabled:opacity-40 flex items-center justify-center gap-4 active:scale-[0.98]">
            <div className="absolute inset-0 bg-[#ff356c] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <div className="relative z-10 flex items-center gap-4">
              {isAdding ? (
                <RefreshCcw className="animate-spin" size={16} />
              ) : (
                <ShoppingBag
                  size={18}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
              )}
              {isAdding ? "Syncing..." : "Authorize Acquisition"}
            </div>
          </button>

          <div className="flex items-center justify-center gap-3 opacity-30">
            <Lock size={10} />
            <p className="text-[8px] font-black uppercase tracking-widest">
              Secure Handshake Active
            </p>
          </div>
        </div>

        <p className="text-[9px] text-center text-slate-300 uppercase tracking-widest italic font-serif max-w-[260px] mx-auto leading-relaxed">
          Crafted in limited runs to preserve architectural integrity.
        </p>
      </section>

      {/* 4. UTILITY MANIFEST */}
      <section className="pt-10 space-y-10 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950">
              Transmit Manifest
            </span>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">
              Digital share protocol
            </p>
          </div>
          <ShareSection />
        </div>

        <div className="grid grid-cols-1 gap-px bg-slate-200 border border-slate-200 overflow-hidden rounded-sm">
          <div className="p-6 bg-white flex items-center gap-5">
            <ShieldCheck
              size={20}
              className="text-[#ff356c]"
              strokeWidth={1.5}
            />
            <div className="space-y-0.5">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-950">
                Identity Guarantee
              </h4>
              <p className="text-[8px] text-slate-400 uppercase tracking-tighter leading-none">
                100% Verified Craftsmanship
              </p>
            </div>
          </div>
          <div className="p-6 bg-white">
            <TrustBadges />
          </div>
        </div>
      </section>
    </div>
  );
};

// Simplified CheckCircle for consistency
const CheckCircle = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default ProductInfo;
