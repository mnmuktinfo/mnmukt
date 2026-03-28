import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSection = ({ desktopSlides, mobileSlides }) => {
  // Determine the total number of slides
  const length = Math.max(desktopSlides.length, mobileSlides.length);
  const [index, setIndex] = useState(0);

  // Manual Navigation
  const nextSlide = () => setIndex((prev) => (prev + 1) % length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + length) % length);

  // Auto Slide Effect
  useEffect(() => {
    if (length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, 5000); // Increased to 5 seconds to let the slow zoom effect breathe

    return () => clearInterval(timer);
  }, [length, index]);

  if (length === 0) return null;

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] lg:h-[90vh] overflow-hidden bg-[#FAFAFA] shrink-0 group font-sans">
      {/* ── Slides Container ── */}
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            i === index
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}>
          {/* Cinematic Zoom Effect: 
            The image slowly scales from 100% to 105% while it is active. 
            When inactive, it snaps back to normal scale instantly so it's ready for the next cycle. 
          */}
          <div
            className={`w-full h-full transform transition-transform ease-out ${i === index ? "scale-105 duration-[6000ms]" : "scale-100 duration-0"}`}>
            {/* Desktop Image - Hidden on mobile */}
            {desktopSlides[i] && (
              <img
                src={desktopSlides[i]}
                alt={`Hero Banner ${i + 1} Desktop`}
                className="hidden md:block w-full h-full object-cover object-top lg:object-center"
                loading={i === 0 ? "eager" : "lazy"}
                fetchpriority={i === 0 ? "high" : "auto"}
              />
            )}

            {/* Mobile Image - Visible on mobile */}
            {mobileSlides[i] && (
              <img
                src={mobileSlides[i]}
                alt={`Hero Banner ${i + 1} Mobile`}
                className="block md:hidden w-full h-full object-cover object-center"
                loading={i === 0 ? "eager" : "lazy"}
                fetchpriority={i === 0 ? "high" : "auto"}
              />
            )}
          </div>

          {/* Subtle gradient overlay to ensure the navigation dots and any potential future text are always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none"></div>
        </div>
      ))}

      {/* ── Editorial Navigation Arrows (Visible on Hover) ── */}
      {length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 text-white bg-black/10 hover:bg-black/30 p-3 rounded-full opacity-0 md:group-hover:opacity-100 transition-all duration-500 backdrop-blur-md hidden md:flex">
            <ChevronLeft size={24} strokeWidth={1} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 text-white bg-black/10 hover:bg-black/30 p-3 rounded-full opacity-0 md:group-hover:opacity-100 transition-all duration-500 backdrop-blur-md hidden md:flex">
            <ChevronRight size={24} strokeWidth={1} />
          </button>
        </>
      )}

      {/* ── Premium Pill Indicators ── */}
      {length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {Array.from({ length }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-500 ease-in-out relative overflow-hidden ${
                i === index
                  ? "w-10 bg-white/30"
                  : "w-2 bg-white/50 hover:bg-white"
              }`}>
              {/* Animated Progress Bar inside the active pill */}
              {i === index && (
                <div
                  className="absolute top-0 left-0 h-full bg-[#da127d] transition-none animate-[progress_5s_linear_forwards]"
                  style={{ animationName: "progress" }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add this CSS animation to your global stylesheet or via a <style> tag */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `,
        }}
      />
    </div>
  );
};

export default HeroSection;
