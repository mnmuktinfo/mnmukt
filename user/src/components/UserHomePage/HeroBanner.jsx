import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IMAGES } from "../../assets/images";

const HeroBanner = () => {
  const desktopSlides = [
    IMAGES.desktopImage1,
    IMAGES.desktopImage2,
    IMAGES.desktopImage3,
  ];

  const mobileSlides = [
    IMAGES.mobileImage1,
    IMAGES.mobileImage2,
    IMAGES.mobileImage3,
  ];

  const isMobile = window.innerWidth < 768;
  const slides = isMobile ? mobileSlides : desktopSlides;

  const [index, setIndex] = useState(0);

  // ✅ Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: isMobile ? "100vh" : "80vh",
      }}>
      {/* ✅ Slides */}
      {slides.map((img, i) => (
        <img
          key={i}
          src={img}
          alt="Hero Slide"
          className={`
            absolute inset-0 w-full h-full object-cover 
            transition-opacity duration-[1500ms] ease-out
            ${i === index ? "opacity-100" : "opacity-0"}
          `}
        />
      ))}

      {/* ✅ Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* ✅ CTA Centered */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <NavLink
          to="/shop"
          className="
            px-7 py-3
            text-white
            border border-white
            rounded-full
            font-medium tracking-wide
            hover:bg-white hover:text-black
            transition duration-300
          ">
          Shop Now
        </NavLink>
      </div>

      {/* ✅ Smooth subtle zoom animation */}
      <style>{`
        img {
          animation: zoomIn 12s ease-in-out infinite;
        }
        @keyframes zoomIn {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default HeroBanner;
