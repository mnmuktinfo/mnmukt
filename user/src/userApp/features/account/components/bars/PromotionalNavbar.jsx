import React, { useEffect, useState, useRef } from "react";
import { COLORS } from "../../../../../style/theme";

const PromotionalSlider = ({ items = [], interval = 3000 }) => {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  useEffect(() => {
    if (items.length === 0) return;

    timer.current = setInterval(() => nextSlide(), interval);
    return () => clearInterval(timer.current);
  }, [items, interval]);

  if (!items || items.length === 0) return null;

  const item = items[index];

  return (
    <div
      className="w-full h-15 py-3 flex items-center justify-center text-center"
      style={{
        background: COLORS.light, // always white
        color: item.textColor || COLORS.textAlt,
        fontFamily: "Poppins, sans-serif",
      }}>
      {/* Message */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{item.message}</span>

        {item.linkUrl && (
          <a
            href={item.linkUrl}
            className="underline underline-offset-4"
            style={{ color: item.linkColor || COLORS.primaryAlt }}>
            {item.linkText || "Learn More"}
          </a>
        )}
      </div>
    </div>
  );
};

export default PromotionalSlider;
