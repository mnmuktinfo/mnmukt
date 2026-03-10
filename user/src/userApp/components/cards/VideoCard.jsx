import React from "react";
import { Play } from "lucide-react";

const VideoCard = ({ url }) => {
  return (
    <div className="relative w-72 md:w-80 h-96 overflow-hidden group flex-shrink-0 shadow-lg hover:shadow-2xl transition-all duration-500">
      <video
        src={url}
        muted
        autoPlay
        loop
        playsInline
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
        <Play className="text-white w-12 h-12 drop-shadow-xl" />
      </div>
    </div>
  );
};

export default VideoCard;
