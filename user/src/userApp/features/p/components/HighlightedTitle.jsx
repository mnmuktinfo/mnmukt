import React, { useId } from "react";

const HighlightedTitle = ({
  text = "Bestsellers",
  baseColor = "#ffd1dc", // Lighter background swipe
  highlightColor = "#ffb3c6", // Deeper inner swipe
  textColor = "text-[#111827]",
  textSize = "text-[22px]",
  className = "", // For any extra wrapper positioning
}) => {
  // Generate a unique ID for the SVG filter so multiple components
  // on the same page don't break each other's SVG paths.
  const uniqueId = useId().replace(/:/g, "");
  const filterId = `marker_texture_${uniqueId}`;

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative inline-flex items-center justify-center px-4 py-1">
        {/* Beautiful Organic Marker Stroke SVG */}
        <svg
          className="absolute inset-0 w-[120%] h-[140%] -left-[10%] -top-[20%] z-0 pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 200 60"
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Unique filter ID applied here */}
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.08"
                numOctaves="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="4.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>

          {/* Layer 1: Lighter background swipe */}
          <polygon
            points="5,25 195,15 190,48 8,45"
            fill={baseColor}
            filter={`url(#${filterId})`}
          />

          {/* Layer 2: Deeper inner swipe to create depth */}
          <polygon
            points="15,32 185,25 195,40 10,42"
            fill={highlightColor}
            opacity="0.9"
            filter={`url(#${filterId})`}
          />
        </svg>

        {/* Text */}
        <h1
          className={`relative z-10 font-black tracking-tight ${textSize} ${textColor}`}>
          {text}
        </h1>
      </div>
    </div>
  );
};

export default HighlightedTitle;
