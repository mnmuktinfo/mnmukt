import React, { useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SizeSelector from "../../../../components/selector/SizeSelector";
import { useCart } from "../../../cart/context/CartContext";

const MoveToCartPopUp = ({ onClose, product, onCompleted }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  const handleAdd = async () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError("Please select a size");
      return;
    }

    await addToCart({
      id: product.id,
      selectedSize: selectedSize,
      selectedQuantity: 1,
    });

    if (onCompleted) onCompleted();
    onClose();
  };

  const price = Number(product.price);
  const originalPrice = Number(product.originalPrice);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 bg-white md:bg-black/40 md:backdrop-blur-sm flex flex-col md:items-center md:justify-center z-[100]">
      {/* Container: 
          - Mobile: Full width/height, no rounding
          - Desktop: Max width, centered, rounded corners
      */}
      <div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-2xl md:shadow-2xl flex flex-col relative animate-in slide-in-from-bottom md:zoom-in duration-300">
        {/* MOBILE HEADER BAR */}
        <div className="flex md:hidden items-center justify-between px-4 h-16 border-b border-slate-50">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-900">
            <ChevronLeft size={24} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">
            Select Size
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* DESKTOP CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-5 right-5 p-2 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={20} />
        </button>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* PRODUCT INFO */}
          <div className="flex gap-6 mb-10">
            <div className="shrink-0">
              <img
                src={
                  product.images?.[0] || product.banner || "/placeholder.jpg"
                }
                alt={product.name}
                className="w-24 h-32 object-cover border border-slate-50"
              />
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-light tracking-tighter text-slate-900 leading-tight mb-2 italic font-serif">
                {product.name}
              </h3>

              <div className="flex items-baseline gap-3">
                <span className="text-lg font-medium text-slate-950">
                  ₹{price}
                </span>
                {originalPrice > price && (
                  <span className="line-through text-xs text-slate-300 tracking-tighter">
                    ₹{originalPrice}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-[10px] font-black text-[#FF356C] uppercase tracking-widest">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-50 w-full mb-10" />

          {/* SIZE SELECTOR SECTION */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                  Available Sizes
                </h4>
                {error && (
                  <span className="text-[10px] text-[#FF356C] font-black uppercase tracking-widest">
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
            </div>
          )}
        </div>

        {/* STICKY FOOTER BUTTON */}
        <div className="p-6 md:p-8 border-t border-slate-50 bg-white">
          <button
            onClick={handleAdd}
            className={`
              w-full py-5 text-[10px] font-black tracking-[0.4em] uppercase transition-all
              ${
                !product.sizes || selectedSize
                  ? "bg-slate-950 text-white hover:bg-[#FF356C]"
                  : "bg-slate-50 text-slate-300 cursor-not-allowed"
              }
            `}>
            {selectedSize ? `Move to Cart — ${selectedSize}` : "Select a Size"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveToCartPopUp;
