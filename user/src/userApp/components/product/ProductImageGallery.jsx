import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/* ── Fullscreen Lightbox ── */
const FullScreenViewer = ({ images, activeIndex, onImageChange, onClose }) => {
  const handleNav = (dir) => {
    const next =
      dir === "next"
        ? (activeIndex + 1) % images.length
        : (activeIndex - 1 + images.length) % images.length;
    onImageChange(next);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNav("next");
      if (e.key === "ArrowLeft") handleNav("prev");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex]);

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex flex-col animate-in fade-in duration-200 font-sans">
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <span className="font-bold tracking-widest uppercase text-sm text-gray-900">
          {activeIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
          aria-label="Close fullscreen">
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-16 bg-gray-50">
        <img
          src={images[activeIndex]}
          alt={`Fullscreen view ${activeIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              onClick={() => handleNav("prev")}>
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <button
              className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              onClick={() => handleNav("next")}>
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onImageChange(i)}
            className={`w-14 h-20 flex-shrink-0 overflow-hidden border-2 transition-all ${
              activeIndex === i
                ? "border-gray-900 opacity-100"
                : "border-transparent opacity-40 hover:opacity-100 hover:border-gray-300"
            }`}>
            <img
              src={img}
              alt={`Thumb ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   Main Component (2-Column Grid)
══════════════════════════════════════════════════ */
const ProductImageGallery = ({ images = [], productName = "Product" }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fsIndex, setFsIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  const openFullScreen = (index) => {
    setFsIndex(index);
    setIsFullScreen(true);
  };

  // Track mobile scroll to update the counter pill
  const handleMobileScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const currentIndex = Math.round(scrollLeft / width);
    if (currentIndex !== mobileActiveIndex) {
      setMobileActiveIndex(currentIndex);
    }
  };

  if (!images?.length) return null;

  return (
    <>
      <div className="w-full relative">
        {/* --- DESKTOP: 2-Column Grid --- */}
        <div className="hidden lg:grid grid-cols-2 gap-4 w-full">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] bg-gray-100 overflow-hidden group cursor-zoom-in"
              onClick={() => openFullScreen(i)}>
              <img
                src={img}
                alt={`${productName} view ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading={i > 3 ? "lazy" : "eager"}
              />
            </div>
          ))}
        </div>

        {/* --- MOBILE: Full-bleed Swipe Carousel --- */}
        <div className="lg:hidden relative">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onScroll={handleMobileScroll}>
            {images.map((img, i) => (
              <div
                key={i}
                className="w-full flex-shrink-0 snap-center aspect-[4/5] bg-gray-100"
                onClick={() => openFullScreen(i)}>
                <img
                  src={img}
                  alt={`${productName} view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Mobile Image Counter Pill */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-900 px-3 py-1.5 text-[11px] font-bold tracking-widest shadow-sm pointer-events-none">
            {mobileActiveIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Fullscreen viewer */}
      {isFullScreen && (
        <FullScreenViewer
          images={images}
          activeIndex={fsIndex}
          onImageChange={setFsIndex}
          onClose={() => setIsFullScreen(false)}
        />
      )}
    </>
  );
};

export default ProductImageGallery;
