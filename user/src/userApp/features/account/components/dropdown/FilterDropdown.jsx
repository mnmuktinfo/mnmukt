import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { COLORS } from "../../../../style/theme";

const FILTER_MENUS = [
  "Price",
  "Category",
  "Size",
  "Bottom Size",
  "Color",
  "Fabric",
];

const PRICE_RANGE = {
  min: 500,
  max: 20000,
};

const CATEGORY_OPTIONS = [
  "Co-ord Set (117)",
  "Dress (18)",
  "Jacket (9)",
  "Kaftan (1)",
  "Kurta (9)",
  "Kurta Sets (20)",
  "Shirt (26)",
  "Top (11)",
];

const SIZE_OPTIONS = [
  "XS (140)",
  "S (140)",
  "M (140)",
  "L (138)",
  "XL (137)",
  "2XL (119)",
  "3XL (33)",
  "4XL (8)",
];

const COLOR_OPTIONS = [
  "#000000",
  "#ffffff",
  "#e53935",
  "#3949ab",
  "#00897b",
  "#ffb300",
  "#8e24aa",
];

const FilterDropdown = ({ onApply }) => {
  const [open, setOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(null);
  const [price, setPrice] = useState(PRICE_RANGE.max);
  const boxRef = useRef(null);

  // Close outside click
  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setSubOpen(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      {/* Main button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
        style={{ borderColor: COLORS.secondary, color: COLORS.textAlt }}>
        Filters <ChevronDown size={16} />
      </button>

      {/* MAIN FILTER PANEL */}
      {open && !subOpen && (
        <div
          className="absolute mt-2 w-56 rounded-lg shadow-xl z-50 py-3"
          style={{
            background: COLORS.light,
            border: `1px solid ${COLORS.secondary}`,
          }}>
          {FILTER_MENUS.map((m) => (
            <button
              key={m}
              onClick={() => setSubOpen(m)}
              className="flex justify-between w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              style={{ color: COLORS.text }}>
              {m}
              <ChevronDown size={14} />
            </button>
          ))}
        </div>
      )}

      {/* SUB FILTER PANEL */}
      {subOpen && (
        <div
          className="absolute mt-2 w-64 rounded-lg shadow-xl z-50 py-4"
          style={{
            background: COLORS.light,
            border: `1px solid ${COLORS.secondary}`,
          }}>
          <div className="flex items-center gap-2 px-4 mb-3">
            <button onClick={() => setSubOpen(null)}>
              <ChevronLeft size={18} />
            </button>
            <p
              className="text-sm font-semibold"
              style={{ color: COLORS.textAlt }}>
              {subOpen}
            </p>
          </div>

          {/* ✅ PRICE RANGE */}
          {subOpen === "Price" && (
            <div className="px-4">
              <p className="text-sm mb-2">Up to ₹{price}</p>
              <input
                type="range"
                min={PRICE_RANGE.min}
                max={PRICE_RANGE.max}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full"
              />
              <button
                className="mt-3 w-full py-2 rounded text-sm"
                style={{
                  background: COLORS.primaryAlt,
                  color: COLORS.light,
                }}
                onClick={() => onApply({ price })}>
                Apply
              </button>
            </div>
          )}

          {/* ✅ CATEGORY LIST */}
          {subOpen === "Category" && (
            <div className="px-4 flex flex-col gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  {c}
                </label>
              ))}
            </div>
          )}

          {/* ✅ SIZE LIST */}
          {subOpen === "Size" && (
            <div className="px-4 flex flex-col gap-2">
              {SIZE_OPTIONS.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  {s}
                </label>
              ))}
            </div>
          )}

          {/* ✅ COLOR PICKER */}
          {subOpen === "Color" && (
            <div className="px-4 py-2 flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((col, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 rounded-full cursor-pointer border"
                  style={{ background: col }}></div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
