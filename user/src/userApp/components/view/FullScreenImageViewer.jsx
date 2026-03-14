import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/* ── Responsive Lightbox (Fullscreen Mobile, Popup Desktop) ── */
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
  }, [activeIndex, onClose, images.length, onImageChange]);

  // Click outside to close (desktop only)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    /* ── Backdrop (Dark blur on desktop, Solid white on mobile) ── */
    <div
      className="fixed inset-0 z-[1000] bg-white md:bg-black/80 md:backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 font-sans md:p-8 lg:p-12"
      onClick={handleBackdropClick}>
      <div className="relative w-full h-full md:w-full md:max-w-5xl md:h-[85vh] bg-[#fcfcfc] md:rounded-2xl flex flex-col overflow-hidden md:shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 md:zoom-in-90 duration-300">
        {/* Header Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20 pointer-events-none">
          <span className="pointer-events-auto font-bold tracking-[0.2em] uppercase text-xs md:text-sm text-gray-900 bg-white/90 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
            {activeIndex + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full text-gray-900 hover:bg-gray-100 hover:text-[#ff3f6c] shadow-sm transition-all active:scale-95"
            aria-label="Close viewer">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Main Image Area */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
          <img
            src={images[activeIndex]}
            alt={`Fullscreen view ${activeIndex + 1}`}
            className="w-full h-full object-contain p-0 md:p-12 pb-28 md:pb-32"
            /* Added bottom padding so the image doesn't hide behind the thumbnails */
          />

          {/* Navigation Arrows (Desktop Only) */}
          {images.length > 1 && (
            <>
              <button
                className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] text-gray-900 hover:text-[#ff3f6c] transition-all hover:scale-105 active:scale-95 z-20"
                onClick={() => handleNav("prev")}>
                <ChevronLeft size={24} strokeWidth={2.5} className="-ml-1" />
              </button>
              <button
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] text-gray-900 hover:text-[#ff3f6c] transition-all hover:scale-105 active:scale-95 z-20"
                onClick={() => handleNav("next")}>
                <ChevronRight size={24} strokeWidth={2.5} className="-mr-1" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Strip */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-20">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onImageChange(i)}
              className={`w-14 h-20 md:w-16 md:h-24 flex-shrink-0 overflow-hidden rounded-sm transition-all duration-300 bg-white shadow-sm ${
                activeIndex === i
                  ? "border-2 border-[#ff3f6c] opacity-100 scale-105 shadow-md"
                  : "border border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400"
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
    </div>
  );
};

export default FullScreenViewer;
