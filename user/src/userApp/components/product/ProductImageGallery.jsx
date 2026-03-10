import React, { useState, useCallback, useMemo } from "react";
import {
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Heart,
} from "lucide-react";
import FullScreenImageViewer from "../view/FullScreenImageViewer";

const ProductImageGallery = ({
  images = [],
  activeIndex = 0,
  onImageChange,
  productName,
  discountBadge = null,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });

  // --- Logic for Magnifying Glass Effect (Myntra Type) ---
  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleNavigate = useCallback(
    (direction) => {
      let nextIndex;
      if (direction === "next") {
        nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
      } else {
        nextIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
      }
      onImageChange(nextIndex);
    },
    [activeIndex, images.length, onImageChange],
  );

  const currentImage = useMemo(
    () => images[activeIndex],
    [images, activeIndex],
  );

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 items-start">
      {/* 1. MYNTRA THUMBNAIL STRIP */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:max-h-[600px] shrink-0">
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            onMouseEnter={() => onImageChange(index)} // Myntra-style hover change
            className={`relative shrink-0 w-14 h-18 lg:w-20 lg:h-28 cursor-pointer transition-all duration-300 ${
              activeIndex === index
                ? "ring-1 ring-slate-900 shadow-lg"
                : "opacity-70 hover:opacity-100"
            }`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* 2. MAIN IMAGE VIEWER (The Stage) */}
      <div className="relative flex-1 group bg-white border border-slate-100 cursor-zoom-in overflow-hidden">
        {/* Floating Badge HUD */}
        {discountBadge && (
          <div className="absolute top-4 left-4 z-20 bg-[#ff356c] text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl">
            {discountBadge}
          </div>
        )}

        {/* Top Right Action HUD */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button className="p-3 bg-white border border-slate-100 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
            <Share2 size={16} className="text-slate-600" />
          </button>
          <button
            onClick={() => setIsFullScreen(true)}
            className="p-3 bg-white border border-slate-100 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
            <Maximize2 size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Main Image Canvas with Zoom Engine */}
        <div
          className="relative w-full aspect-3/4 lg:h-[750px] overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomPos((p) => ({ ...p, show: false }))}
          onClick={() => setIsFullScreen(true)}>
          <img
            src={currentImage}
            alt={productName}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              zoomPos.show ? "scale-150" : "scale-100"
            }`}
            style={
              zoomPos.show
                ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                : {}
            }
          />
        </div>

        {/* Standard Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate("prev");
            }}
            className="p-3 bg-white/90 shadow-2xl rounded-full hover:bg-white transition-all">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate("next");
            }}
            className="p-3 bg-white/90 shadow-2xl rounded-full hover:bg-white transition-all">
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Item Counter HUD */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
          <p className="text-[10px] font-black text-slate-900 tracking-[0.2em]">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* 3. FULL SCREEN INTERFACE */}
      {isFullScreen && (
        <FullScreenImageViewer
          images={images}
          activeIndex={activeIndex}
          onImageChange={onImageChange}
          onClose={() => setIsFullScreen(false)}
        />
      )}
    </div>
  );
};

export default ProductImageGallery;
