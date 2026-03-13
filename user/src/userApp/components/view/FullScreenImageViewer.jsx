import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   FullScreenImageViewer — Luxury Ethnic Wear Edition
   Aesthetic: Warm ink · Antique gold · Biba / Manyavar-inspired
   Stack: Tailwind CSS utility classes only
───────────────────────────────────────────────────────────── */

/* Minimal custom styles for things Tailwind can't express */
const CUSTOM = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500;600&display=swap');
  .fsv-font-serif  { font-family: 'Cormorant Garamond', serif; }
  .fsv-font-sans   { font-family: 'Jost', sans-serif; }
  .fsv-gold-bar    { background: linear-gradient(90deg, transparent 0%, #D4A843 50%, transparent 100%); }
  .fsv-no-scroll::-webkit-scrollbar { display: none; }
  .fsv-no-scroll   { scrollbar-width: none; -ms-overflow-style: none; }
  .fsv-fade-in     { animation: fsvIn 0.3s cubic-bezier(0.33,1,0.68,1) both; }
  @keyframes fsvIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
  .fsv-slide-up    { animation: fsvUp 0.32s cubic-bezier(0.33,1,0.68,1) both; }
  @keyframes fsvUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fsv-corner-tl   { border-top: 1.5px solid rgba(212,168,67,0.45); border-left: 1.5px solid rgba(212,168,67,0.45); }
  .fsv-corner-tr   { border-top: 1.5px solid rgba(212,168,67,0.45); border-right: 1.5px solid rgba(212,168,67,0.45); }
  .fsv-corner-bl   { border-bottom: 1.5px solid rgba(212,168,67,0.45); border-left: 1.5px solid rgba(212,168,67,0.45); }
  .fsv-corner-br   { border-bottom: 1.5px solid rgba(212,168,67,0.45); border-right: 1.5px solid rgba(212,168,67,0.45); }
`;

/* Touch swipe helper */
const useSwipe = (onLeft, onRight) => {
  const startX = useRef(null);
  return {
    onTouchStart: (e) => {
      startX.current = e.touches[0].clientX;
    },
    onTouchEnd: (e) => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(dx) > 44) dx < 0 ? onLeft() : onRight();
      startX.current = null;
    },
  };
};

const FullScreenImageViewer = ({
  images = [],
  activeIndex,
  onImageChange,
  onClose,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const stripRef = useRef(null);

  /* Lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Reset load state on image change */
  useEffect(() => {
    setImgLoaded(false);
    setZoomed(false);
  }, [activeIndex]);

  /* Scroll active thumb into view */
  useEffect(() => {
    if (!stripRef.current) return;
    const thumb = stripRef.current.children[activeIndex];
    if (thumb)
      thumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
  }, [activeIndex]);

  const handlePrev = useCallback(() => {
    onImageChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  }, [activeIndex, images.length, onImageChange]);

  const handleNext = useCallback(() => {
    onImageChange(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, images.length, onImageChange]);

  /* Keyboard */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
      if (e.key === "z") setZoomed((z) => !z);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handlePrev, handleNext, onClose]);

  /* Swipe */
  const swipe = useSwipe(handleNext, handlePrev);

  /* Zoom on mouse move */
  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    setZoomOrigin({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  };

  const handleToggleZoom = (e) => {
    e.stopPropagation();
    setZoomed((z) => !z);
  };

  const currentImg = images[activeIndex];

  return (
    <>
      <style>{CUSTOM}</style>

      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[200] fsv-font-sans fsv-fade-in"
        style={{ background: "rgba(10,8,4,0.97)" }}
        onClick={onClose}>
        {/* Gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] fsv-gold-bar opacity-60 z-10" />

        {/* ── TOP BAR ── */}
        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 md:px-8 md:py-5"
          onClick={(e) => e.stopPropagation()}>
          {/* Brand watermark */}
          <div
            className="fsv-font-serif text-xl font-light tracking-widest select-none"
            style={{
              color: "rgba(255,255,255,0.18)",
              letterSpacing: "0.18em",
            }}>
            Munmukt
          </div>

          {/* Counter */}
          <div
            className="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-[0.28em] uppercase"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <span style={{ color: "#D4A843" }}>{activeIndex + 1}</span>
            <span className="mx-2" style={{ color: "rgba(255,255,255,0.2)" }}>
              /
            </span>
            {images.length}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Zoom toggle */}
            <button
              onClick={handleToggleZoom}
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                border: `1px solid ${zoomed ? "rgba(212,168,67,0.6)" : "rgba(255,255,255,0.15)"}`,
                background: zoomed
                  ? "rgba(212,168,67,0.12)"
                  : "rgba(255,255,255,0.06)",
                color: zoomed ? "#D4A843" : "rgba(255,255,255,0.55)",
              }}>
              {zoomed ? (
                <ZoomOut size={14} strokeWidth={1.5} />
              ) : (
                <ZoomIn size={14} strokeWidth={1.5} />
              )}
            </button>

            {/* Download */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(currentImg, "_blank");
              }}
              aria-label="Open image"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,168,67,0.12)";
                e.currentTarget.style.color = "#D4A843";
                e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              }}>
              <Download size={14} strokeWidth={1.5} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close fullscreen"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.7)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}>
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* ── MAIN IMAGE AREA ── */}
        <div
          className="absolute inset-0 flex items-center justify-center pt-16 pb-28 px-4 md:pb-36"
          onClick={(e) => e.stopPropagation()}
          {...swipe}>
          {/* Left Nav */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 md:left-8 z-10 w-10 h-10 rounded-full hidden sm:flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{
                border: "1px solid rgba(212,168,67,0.25)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,168,67,0.12)";
                e.currentTarget.style.color = "#D4A843";
                e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.borderColor = "rgba(212,168,67,0.25)";
              }}>
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
          )}

          {/* Image wrapper with ornamental corners */}
          <div
            className="relative max-h-full max-w-full flex items-center justify-center"
            style={{ maxWidth: "min(78vw, 580px)", maxHeight: "75vh" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => zoomed && setZoomOrigin({ x: 50, y: 50 })}
            onClick={handleToggleZoom}>
            {/* Ornament corners */}
            <div className="absolute top-0 left-0 w-5 h-5 pointer-events-none z-10 fsv-corner-tl" />
            <div className="absolute top-0 right-0 w-5 h-5 pointer-events-none z-10 fsv-corner-tr" />
            <div className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none z-10 fsv-corner-bl" />
            <div className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none z-10 fsv-corner-br" />

            {/* Shimmer */}
            {!imgLoaded && (
              <div
                className="absolute inset-0 animate-pulse rounded-sm"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            )}

            <img
              key={currentImg}
              src={currentImg}
              alt={`View ${activeIndex + 1}`}
              className="max-h-full max-w-full object-contain select-none block transition-all duration-500"
              style={{
                opacity: imgLoaded ? 1 : 0,
                cursor: zoomed ? "zoom-out" : "zoom-in",
                transform: zoomed ? "scale(2)" : "scale(1)",
                transformOrigin: zoomed
                  ? `${zoomOrigin.x}% ${zoomOrigin.y}%`
                  : "center center",
              }}
              onLoad={() => setImgLoaded(true)}
              draggable={false}
            />

            {/* Zoom label */}
            {!zoomed && imgLoaded && (
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-medium tracking-[0.18em] uppercase px-3 py-1.5 pointer-events-none"
                style={{
                  background: "rgba(10,8,4,0.5)",
                  color: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(8px)",
                }}>
                <ZoomIn size={9} strokeWidth={1.5} />
                Click to zoom
              </div>
            )}
          </div>

          {/* Right Nav */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 md:right-8 z-10 w-10 h-10 rounded-full hidden sm:flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{
                border: "1px solid rgba(212,168,67,0.25)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,168,67,0.12)";
                e.currentTarget.style.color = "#D4A843";
                e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.borderColor = "rgba(212,168,67,0.25)";
              }}>
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* ── BOTTOM THUMBNAIL STRIP ── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-40 fsv-slide-up"
          style={{
            background: "rgba(10,8,4,0.85)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(212,168,67,0.12)",
          }}
          onClick={(e) => e.stopPropagation()}>
          {/* Gold separator line */}
          <div className="h-[1px] w-24 mx-auto fsv-gold-bar opacity-30 mb-0" />

          <div className="py-4 md:py-5 px-4">
            {/* Thumbnail row */}
            <div
              ref={stripRef}
              className="flex justify-start md:justify-center gap-2.5 overflow-x-auto fsv-no-scroll max-w-2xl mx-auto snap-x snap-mandatory px-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => onImageChange(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className="relative flex-shrink-0 w-12 md:w-14 snap-center overflow-hidden transition-all duration-250 outline-none"
                  style={{
                    aspectRatio: "3/4",
                    opacity: activeIndex === i ? 1 : 0.38,
                    border:
                      activeIndex === i
                        ? "1.5px solid #D4A843"
                        : "1.5px solid transparent",
                    transform: activeIndex === i ? "scale(1)" : "scale(0.94)",
                  }}
                  onMouseEnter={(e) => {
                    if (activeIndex !== i) {
                      e.currentTarget.style.opacity = "0.75";
                      e.currentTarget.style.transform = "scale(0.97)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeIndex !== i) {
                      e.currentTarget.style.opacity = "0.38";
                      e.currentTarget.style.transform = "scale(0.94)";
                    }
                  }}>
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover object-top block"
                    loading="lazy"
                  />
                  {/* Active gold underline */}
                  {activeIndex === i && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: "#D4A843" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Keyboard hint — desktop only */}
            <p
              className="hidden md:flex items-center justify-center gap-4 mt-3 text-[9px] tracking-[0.22em] uppercase"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              <span>← → Navigate</span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
              <span>Z Zoom</span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
              <span>Esc Close</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullScreenImageViewer;
