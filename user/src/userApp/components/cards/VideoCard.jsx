import React, { useRef, useState } from "react";

const VideoCard = ({ url }) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  return (
    <div
      className={`relative w-[clamp(240px,28vw,340px)] aspect-4/5 overflow-hidden bg-[#111] cursor-pointer
         hover:scale-[1.03] transition-all duration-500 shadow-[0_2px_12px_rgba(218,18,125,0.06),0_8px_32px_rgba(218,18,125,0.12)]
         hover:shadow-[0_8px_28px_rgba(218,18,125,0.14),0_16px_48px_rgba(218,18,125,0.22)]`}
      onClick={handleClick}>
      {/* Video */}
      <video
        ref={videoRef}
        src={url}
        muted
        autoPlay
        loop
        playsInline
        className={`w-full h-full object-cover transform transition-all duration-700
          ${!isPaused ? "brightness-[0.78] saturate-[1.1] scale-[1.06]" : "brightness-[0.92] saturate-[1.05]"}`}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />

      {/* Pink Shimmer */}
      <div className="absolute top-0 -left-full w-3/5 h-full bg-gradient-to-r from-transparent via-pink-500/10 to-transparent pointer-events-none z-10 transition-all duration-800 ease-in-out hover:left-[140%]" />

      {/* Top-right corner */}
      <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-[1.5px] border-r-[1.5px] border-pink-500 rounded-tr-md opacity-0 scale-90 hover:opacity-100 hover:scale-100 transition-all duration-400" />
      {/* Bottom-left corner */}
      <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-[1.5px] border-l-[1.5px] border-pink-500 rounded-bl-md opacity-0 scale-90 hover:opacity-100 hover:scale-100 transition-all duration-400" />

      {/* Play / Pause Button */}
      <div
        className={`absolute inset-0 flex items-center justify-center z-20
        ${isPaused ? "opacity-100 scale-100" : "opacity-0 scale-90"} transition-all duration-400`}>
        <div className="relative w-14 h-14 flex items-center justify-center">
          {/* Pulsing pink circle */}
          <span className="absolute inset-1.5 rounded-full bg-pink-500/40 animate-pulse"></span>
          {/* Spinning dashed ring */}
          <span className="absolute inset-0 rounded-full border border-dashed border-pink-500 animate-spin-slow"></span>
          {/* Inner circle */}
          <span className="absolute inset-1.5 rounded-full bg-pink-600/10 border border-pink-600/25 backdrop-blur-sm"></span>
          {/* Play/Pause Icon */}
          {isPaused ? (
            <svg
              className="relative z-10 w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg
              className="relative z-10 w-4.5 h-4.5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </div>
      </div>

      {/* Bottom Label */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-4 opacity-0 hover:opacity-100 transition-all duration-450">
        <span className="font-[Cormorant] italic text-white/85 text-[15px]">
          {isPaused ? "Tap to resume" : "Now playing"}
        </span>
        <span className="w-1.5 h-1.5 l bg-pink-500 shadow-[0_0_8px_rgba(218,18,125,0.45)] animate-pulse"></span>
      </div>
    </div>
  );
};

export default VideoCard;
