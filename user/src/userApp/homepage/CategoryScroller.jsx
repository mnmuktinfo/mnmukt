import React, { useRef, useState } from "react";
import CategoriesCard from "../components/cards/CategoriesCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const CategoryScroller = ({ categories, loading, title, subtitle }) => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    setIsScrolling(direction);
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(() => setIsScrolling(null), 400);
  };

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <section className="w-full bg-[#fdf0f5]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="text-center mb-10">
            <div className="h-8 w-64 bg-gray-200 animate-pulse mx-auto"></div>
          </div>

          <div className="flex overflow-hidden flex-nowrap gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-[240px] md:w-[260px] flex-shrink-0 flex flex-col items-center gap-4">
                <div className="aspect-[4/5] w-full bg-gray-100 animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-100 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full relative bg-gradient-to-b from-[#fff7fa] via-white to-[#fff0f6]">
      {/* ✨ Subtle texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#da127d_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative max-w-[1600px] py-5 md:py-10 mx-auto px-4 sm:px-6 lg:px-10">
        {/* ── HEADER ── */}
        <div className="flex flex-col items-center text-center mb-5 md:mb-10">
          {title && (
            <h2 className="text-[20px] md:text-[25px] font-medium text-[#1a1a1a] tracking-[0.01em] leading-tight">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-[15px] md:text-[17px] text-[#2b2a2a] font-normal tracking-[0.02em]">
              {subtitle}
            </p>
          )}
        </div>

        {/* ── SCROLLER ── */}
        <div className="relative group">
          {/* LEFT BUTTON */}
          <button
            onClick={() => scroll("left")}
            className={`group/btn hidden md:flex absolute top-[calc(50%-2rem)] -left-4 lg:-left-6 w-12 h-12 items-center justify-center z-20 transition-all duration-300 opacity-0 group-hover:opacity-100 ${
              isScrolling === "left" ? "scale-90" : "scale-100 hover:scale-110"
            }`}>
            <span className="absolute inset-0 bg-white border border-gray-200 shadow-sm transition-all duration-300 group-hover/btn:border-[#da127d]" />
            <span className="absolute inset-0 bg-[#da127d] scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
            <ChevronLeftIcon className="relative z-10 w-5 h-5 text-gray-600 group-hover/btn:text-white transition-colors duration-300 pr-0.5" />
          </button>

          {/* RIGHT BUTTON */}
          <button
            onClick={() => scroll("right")}
            className={`group/btn hidden md:flex absolute top-[calc(50%-2rem)] -right-4 lg:-right-6 w-12 h-12 items-center justify-center z-20 transition-all duration-300 opacity-0 group-hover:opacity-100 ${
              isScrolling === "right" ? "scale-90" : "scale-100 hover:scale-110"
            }`}>
            <span className="absolute inset-0 bg-white border border-gray-200 shadow-sm transition-all duration-300 group-hover/btn:border-[#da127d]" />
            <span className="absolute inset-0 bg-[#da127d] scale-0 group-hover/btn:scale-100 transition-transform duration-300" />
            <ChevronRightIcon className="relative z-10 w-5 h-5 text-gray-600 group-hover/btn:text-white transition-colors duration-300 pl-0.5" />
          </button>

          {/* ── SCROLL TRACK ── */}
          <div
            ref={scrollRef}
            className="flex items-start overflow-x-auto flex-nowrap gap-4 md:gap-5 pb-6 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className="w-[220px] md:w-60 lg:w-[260px] snap-center sm:snap-start shrink-0">
                <CategoriesCard cat={cat} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryScroller;
