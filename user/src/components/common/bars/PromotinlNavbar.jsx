import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "../../../style/theme";

const PromotionalSlider = ({ items = [], interval = 3000 }) => {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + items.length) % items.length);
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
      className="relative w-full py-3 flex items-center justify-center text-center"
      style={{
        background: COLORS.light, // ✅ always white
        color: item.textColor || COLORS.textAlt,
        fontFamily: "Poppins, sans-serif",
      }}>
      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-3 p-1 rounded-full hover:opacity-70">
        <ChevronLeft size={20} />
      </button>

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

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-3 p-1 rounded-full hover:opacity-70">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default PromotionalSlider;
