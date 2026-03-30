import React, { useRef, useState, useMemo, useCallback } from "react";
import VideoCard from "../components/cards/VideoCard";
import { videos } from "../../assets/videos";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const VideoSection = ({
  title = "Season’s Spotlight",
  subtitle = "Explore our curated fashion videos",
}) => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(null);

  // ✅ memo videos (prevents re-render jitter)
  const videoList = useMemo(() => videos || [], []);

  // ✅ stable scroll function
  const scroll = useCallback((direction) => {
    if (!scrollRef.current) return;

    setIsScrolling(direction);

    const scrollAmount = direction === "left" ? -320 : 320;

    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    setTimeout(() => setIsScrolling(null), 300);
  }, []);

  if (!videoList.length) return null;

  return (
    <section className="w-full bg-linear-to-b from-white via-[#fff7fa] to-white py-5 md:py-10 ">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* ── CLEAN HEADER (only one) ── */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
          <span className="text-[#da127d] uppercase tracking-[0.2em] text-[11px] font-medium mb-2">
            Watch & Discover
          </span>

          <h2 className="text-[20px] md:text-[26px] font-medium text-[#1a1a1a] tracking-[0.01em]">
            {title}
          </h2>

          <p className="mt-2 text-[13px] md:text-[14px] text-[#6b6b6b] max-w-[420px]">
            {subtitle}
          </p>
        </div>

        {/* ── SCROLLER ── */}
        <div className="relative group">
          {/* LEFT */}
          <button
            onClick={() => scroll("left")}
            className={`hidden md:flex absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 items-center justify-center z-20  transition-all duration-300 opacity-0 group-hover:opacity-100 ${
              isScrolling === "left" ? "scale-90" : "hover:scale-110"
            }`}>
            <span className="absolute inset-0 bg-white border border-[#e5e5e5]" />
            <span className="absolute inset-0 bg-[#da127d] scale-0 group-hover:scale-100 transition-transform" />
            <ChevronLeftIcon className="relative w-4 h-4 text-gray-600 group-hover:text-white" />
          </button>

          {/* RIGHT */}
          <button
            onClick={() => scroll("right")}
            className={`hidden md:flex absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-10 items-center justify-center z-20  transition-all duration-300 opacity-0 group-hover:opacity-100 ${
              isScrolling === "right" ? "scale-90" : "hover:scale-110"
            }`}>
            <span className="absolute inset-0 bg-white border border-[#e5e5e5]" />
            <span className="absolute inset-0 bg-[#da127d] scale-0 group-hover:scale-100 transition-transform" />
            <ChevronRightIcon className="relative w-4 h-4 text-gray-600 group-hover:text-white" />
          </button>

          {/* TRACK */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {videoList.map((url, index) => (
              <div
                key={index}
                className="snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[320px] transition-transform duration-300 hover:-translate-y-1">
                <div className="bg-white overflow-hidden">
                  <VideoCard url={url} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(VideoSection);
