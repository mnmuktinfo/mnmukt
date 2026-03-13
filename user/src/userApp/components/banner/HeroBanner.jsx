import React, { useEffect, useState } from "react";
import { IMAGES } from "../../../assets/images";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Added arrows

const HeroBanner = () => {
  // Pull both sets of images directly
  const desktopSlides = IMAGES.hero?.desktopSlides || [];
  const mobileSlides = IMAGES.hero?.mobileSlides || [];

  // Determine the total number of slides
  const length = Math.max(desktopSlides.length, mobileSlides.length);
  const [index, setIndex] = useState(0);

  // Manual Navigation
  const nextSlide = () => setIndex((prev) => (prev + 1) % length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + length) % length);

  // Auto Slide Effect (Resets timer if user manually clicks next/prev)
  useEffect(() => {
    if (length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, 4000); // Changes slide every 4 seconds

    return () => clearInterval(timer);
  }, [length, index]); // Adding 'index' here resets the timer on manual navigation

  if (length === 0) return null;

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] lg:h-[90vh] overflow-hidden bg-[#f4f4f4] shrink-0 group font-sans">
      {/* ── Slides Container ── */}
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            i === index
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}>
          {/* Desktop Image - Hidden on mobile */}
          {desktopSlides[i] && (
            <img
              src={desktopSlides[i]}
              alt={`Hero Banner ${i + 1} Desktop`}
              className="hidden md:block w-full h-full object-center"
              loading={i === 0 ? "eager" : "lazy"}
              fetchpriority={i === 0 ? "high" : "auto"}
            />
          )}

          {/* Mobile Image - Visible on mobile */}
          {mobileSlides[i] && (
            <img
              src={mobileSlides[i]}
              alt={`Hero Banner ${i + 1} Mobile`}
              className="block md:hidden w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              fetchpriority={i === 0 ? "high" : "auto"}
            />
          )}
        </div>
      ))}

      {/* ── Desktop Navigation Arrows (Visible on Hover) ── */}
      {length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/20 hover:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block backdrop-blur-sm">
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/20 hover:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block backdrop-blur-sm">
            <ChevronRight size={28} strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* ── Modern Pill Indicators ── */}
      {length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {Array.from({ length }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                i === index
                  ? "bg-white w-8 shadow-[0_0_4px_rgba(0,0,0,0.3)]"
                  : "bg-white/50 w-2 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
