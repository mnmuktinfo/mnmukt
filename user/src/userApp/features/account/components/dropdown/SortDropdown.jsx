import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { COLORS } from "../../../../style/theme";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "low-high" },
  { label: "Price: High to Low", value: "high-low" },
  { label: "Bestsellers", value: "bestseller" },
];

const SortDropdown = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
        style={{
          borderColor: COLORS.secondary,
          color: COLORS.textAlt,
        }}>
        Sort By <ChevronDown size={16} />
      </button>

      {open && (
        <div
          className="absolute mt-2 w-44 rounded-lg shadow-md z-50 py-2"
          style={{
            background: COLORS.light,
            border: `1px solid ${COLORS.secondary}`,
          }}>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              style={{ color: COLORS.text }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
