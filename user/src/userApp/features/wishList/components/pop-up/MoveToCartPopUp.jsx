import React, { useState } from "react";
import { X, Share2, ShoppingBag } from "lucide-react";
import SizeSelector from "../../../../components/selector/SizeSelector";
import { useCart } from "../../../cart/context/CartContext";

const MoveToCartPopUp = ({ onClose, product, onCompleted }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  const handleAdd = async () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setError("Select size");
      return;
    }

    try {
      await addToCart({
        id: product.id,
        selectedSize,
        selectedQuantity: 1,
      });

      onCompleted?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not add to cart");
    }
  };

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: productUrl,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        alert("Link copied to clipboard");
      } catch {}
    }
  };

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || 0);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center md:justify-center font-sans">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* MODAL */}
      <div className="relative bg-white w-full h-[100dvh] md:h-auto md:w-[480px] shadow-[0_40px_80px_rgba(0,0,0,0.25)] flex flex-col md:rounded-md">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-900 transition">
            <X size={20} />
          </button>

          <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-gray-700">
            Select Size
          </span>

          <button
            onClick={handleShare}
            className="p-1 text-gray-500 hover:text-[#0073e6] transition">
            <Share2 size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* PRODUCT INFO */}
          <div className="flex gap-4 mb-8">
            <div className="w-24 h-32 bg-gray-50 border border-gray-100 overflow-hidden rounded-sm">
              <img
                loading="lazy"
                decoding="async"
                src={
                  product.banner || product.images?.[0] || "/placeholder.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-[9px] tracking-[0.25em] uppercase text-[#da127d] font-semibold mb-1">
                {product.category || "New Arrival"}
              </span>

              <h3
                className="text-[15px] text-gray-900 leading-snug mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.name}
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-gray-900">
                  ₹{price}
                </span>

                {originalPrice > price && (
                  <span className="text-[12px] line-through text-gray-400">
                    ₹{originalPrice}
                  </span>
                )}

                {discount > 0 && (
                  <span className="text-[9px] bg-[#fce4ec] text-[#da127d] px-2 py-[2px] uppercase tracking-wider font-semibold rounded">
                    {discount}% off
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SIZE SECTION */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-[0.35em] text-gray-500 font-semibold">
                  Size
                </span>

                {error && (
                  <span className="text-[10px] text-[#da127d] font-semibold">
                    {error}
                  </span>
                )}
              </div>

              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSizeChange={(size) => {
                  setSelectedSize(size);
                  setError("");
                }}
              />

              <p className="text-[10px] text-gray-400 mt-3">
                True to size • Check size guide for exact fit
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-gray-200 p-5">
          <button
            onClick={handleAdd}
            disabled={product.sizes?.length > 0 && !selectedSize}
            className={`w-full flex items-center justify-center gap-2
              py-3 text-[10px] tracking-[0.35em] uppercase font-semibold
              transition-all duration-300 rounded-md
              ${
                selectedSize || !product.sizes?.length
                  ? "bg-[#da127d] text-white hover:bg-[#c20f6e]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}>
            <ShoppingBag size={16} />
            {selectedSize
              ? `Add To Bag — ${selectedSize}`
              : product.sizes?.length
                ? "Select Size"
                : "Add To Bag"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToCartPopUp;
