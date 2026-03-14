import React, { useState, useRef } from "react";
import { ZoomIn } from "lucide-react";
import FullScreenViewer from "../view/FullScreenImageViewer";

/* ══════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════ */
const ProductImageGallery = ({ images = [], productName = "Product" }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fsIndex, setFsIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const openFullScreen = (index) => {
    setFsIndex(index);
    setIsFullScreen(true);
  };

  // Smoothly track mobile scroll to update the counter pill
  const handleMobileScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const currentIndex = Math.round(scrollLeft / width);
      if (currentIndex !== mobileActiveIndex) {
        setMobileActiveIndex(currentIndex);
      }
    }
  };

  if (!images?.length) return null;

  return (
    <>
      <div className="w-full relative">
        {/* ── DESKTOP: Clean 2-Column Fashion Grid ── */}
        <div className="hidden lg:grid grid-cols-2 gap-3 w-full">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] bg-[#f8f8f8] overflow-hidden group cursor-zoom-in rounded-sm"
              onClick={() => openFullScreen(i)}>
              <img
                src={img}
                alt={`${productName} view ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading={i > 3 ? "lazy" : "eager"}
              />
              {/* Elegant Zoom Hint on Hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-gray-900 shadow-lg">
                  <ZoomIn size={20} strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MOBILE: Full-bleed Swipe Carousel ── */}
        <div className="lg:hidden relative -mx-4 sm:mx-0">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
            onScroll={handleMobileScroll}>
            {images.map((img, i) => (
              <div
                key={i}
                className="w-full flex-shrink-0 snap-center aspect-[4/5] bg-[#f8f8f8] relative"
                onClick={() => openFullScreen(i)}>
                <img
                  src={img}
                  alt={`${productName} view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Mobile Image Counter Pill (Glassmorphism Myntra-style) */}
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md text-gray-900 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-widest shadow-[0_2px_8px_rgba(0,0,0,0.08)] pointer-events-none transition-all">
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
