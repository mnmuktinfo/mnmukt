import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

const FullScreenImageViewer = ({
  images,
  activeIndex,
  onImageChange,
  onClose,
}) => {
  // Prevent background scrolling when viewer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Keyboard navigation for power users/tablets
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const handlePrev = useCallback(() => {
    const prevIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    onImageChange(prevIndex);
  }, [activeIndex, images.length, onImageChange]);

  const handleNext = useCallback(() => {
    const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    onImageChange(nextIndex);
  }, [activeIndex, images.length, onImageChange]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex flex-col transition-all duration-300">
      {/* 1. TOP BAR ACTIONS */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="text-white/70 text-xs tracking-widest font-medium uppercase">
          {activeIndex + 1} <span className="mx-2 text-white/30">/</span>{" "}
          {images.length}
        </div>

        <div className="flex items-center gap-4">
          <button
            className="p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => window.open(images[activeIndex], "_blank")}>
            <Download size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onClose(false)}
            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all active:scale-90">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 2. MAIN IMAGE VIEWPORT */}
      <div className="relative flex-1 flex items-center justify-center w-full touch-pan-y">
        {/* Navigation Arrows (Hidden on mobile, visible on tablet/desktop) */}
        <button
          onClick={handlePrev}
          className="absolute left-4 z-10 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hidden sm:block">
          <ChevronLeft size={40} strokeWidth={1} />
        </button>

        <img
          src={images[activeIndex]}
          alt={`View ${activeIndex + 1}`}
          className="max-h-[85vh] w-full object-contain select-none transition-transform duration-300 ease-out animate-in fade-in zoom-in-95"
        />

        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all hidden sm:block">
          <ChevronRight size={40} strokeWidth={1} />
        </button>
      </div>

      {/* 3. THUMBNAIL TRACK (Premium Strip) */}
      <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar pb-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => onImageChange(index)}
              className={`relative flex-shrink-0 w-14 h-18 rounded-md overflow-hidden transition-all duration-500 transform ${
                activeIndex === index
                  ? "ring-2 ring-white scale-110 opacity-100"
                  : "opacity-40 hover:opacity-100 scale-90"
              }`}>
              <img
                src={img}
                alt={`Thumb ${index}`}
                className="w-full h-full object-cover"
              />
              {activeIndex === index && (
                <div className="absolute inset-0 bg-white/10" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullScreenImageViewer;
