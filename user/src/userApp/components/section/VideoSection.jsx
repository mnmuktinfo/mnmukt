import React from "react";
import VideoCard from "../cards/VideoCard";
import { videos } from "../../../assets/videos";

const VideoSection = () => {
  return (
    <section className="w-full px-4 md:px-12 pb-16 pt-8">
      <h2
        style={{
          fontFamily: "Playfair Display, serif",
        }}
        className="text-center text-3xl md:text-4xl tracking-wide mb-12 text-gray-900">
        Season’s Spotlight{" "}
      </h2>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-10 pb-4">
          {videos.map((url, index) => (
            <VideoCard key={index} url={url} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
