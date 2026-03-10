import React, { useEffect, useState } from "react";
import { IMAGES } from "../../../assets/images";

const HeroBanner = () => {
  // 1. State to track Screen Size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 2. Resize Listener (Updates automatically on window resize)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. Select Slides directly from the optimized IMAGES object
  const slides = isMobile
    ? IMAGES.hero.mobileSlides
    : IMAGES.hero.desktopSlides;

  const [index, setIndex] = useState(0);

  // 4. Auto Slide
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-50"
      // You can adjust this height calc if you want to subtract Navbar height
      style={{ height: "100vh" }}>
      {/* Slides */}
      {slides.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Hero Banner ${i + 1}`}
          className={`
            absolute inset-0 w-full h-full 
            /* Mobile: Cover (Fills screen) | Desktop: Cover or Contain based on preference */
            object-cover md:object-cover
            transition-opacity duration-1200ms ease-out
            ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}
          `}
        />
      ))}

      {/* Optional: Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${i === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"}
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
