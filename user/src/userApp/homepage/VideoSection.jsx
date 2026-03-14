import React from "react";
import VideoCard from "../components/cards/VideoCard";
import { videos } from "../../assets/videos";

const VideoSection = () => {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="w-full bg-white py-16 md:py-24 font-sans border-b border-gray-100">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* --- Premium Header Area --- */}
        <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <span className="text-[#da127d] uppercase tracking-[0.2em] text-xs font-semibold mb-3 block">
            Watch & Discover
          </span>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-4xl lg:text-5xl tracking-wide text-gray-900">
            Season’s Spotlight
          </h2>
          {/* Elegant pink divider line */}
          <div className="w-16 h-[1px] bg-[#da127d] mx-auto mt-6 opacity-50"></div>
        </div>

        {/* --- Smooth Scrolling Video Container --- */}
        {/* Added snap-x and snap-mandatory so videos lock into the center on mobile */}
        <div
          className="flex overflow-x-auto gap-6 md:gap-8 lg:gap-10 pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
          }}>
          {videos.map((url, index) => (
            // The wrapper ensures the cards don't shrink and snap perfectly into view
            <div
              key={index}
              className="snap-center sm:snap-start shrink-0 transition-transform duration-500 hover:-translate-y-2">
              <VideoCard url={url} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
