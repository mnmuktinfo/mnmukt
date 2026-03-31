import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Accordion } from "./components/Accordion";
import { readFilters, toggleParam } from "./utils/filterUtils";
import { BRAND_PINK, COLORS, PRICE_PRESETS, SIZES } from "./constants/filters";

const FilterBody = ({ facets }) => {
  const [sp, setSp] = useSearchParams();
  const filters = useMemo(() => readFilters(sp), [sp]);

  const toggle = (key, val) => setSp(toggleParam(sp, key, val));

  const setPrice = (min, max) => {
    const p = new URLSearchParams(sp);
    const isActive = filters.priceMin === min && filters.priceMax === max;
    p.delete("priceMin");
    p.delete("priceMax");
    if (!isActive) {
      if (min != null) p.set("priceMin", String(min));
      if (max != null) p.set("priceMax", String(max));
    }
    setSp(p);
  };

  const setCustomPrice = (field, val) => {
    const p = new URLSearchParams(sp);
    if (val) p.set(field, val);
    else p.delete(field);
    setSp(p);
  };

  return (
    <div className="px-5">
      {/* SIZE */}
      <Accordion title="Size" badge={filters.sizes.length} defaultOpen>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const cnt = facets.sizes?.get(s) ?? 0;
            const active = filters.sizes.includes(s);
            const disabled = cnt === 0 && !active;
            return (
              <button
                key={s}
                onClick={() => toggle("sizes", s)}
                disabled={disabled}
                className={`relative flex items-center justify-center min-w-[3rem] px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-all duration-200 outline-none ${
                  active
                    ? "text-white shadow-sm border border-transparent"
                    : disabled
                      ? "border border-gray-100 text-gray-300 bg-gray-50/50 cursor-not-allowed"
                      : "border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                }`}
                style={active ? { background: BRAND_PINK } : {}}>
                {s}
              </button>
            );
          })}
        </div>
      </Accordion>

      {/* COLOR */}
      <Accordion title="Color" badge={filters.colors.length}>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(({ name, hex }) => {
            const cnt = facets.colors?.get(name.toLowerCase()) ?? 0;
            const active = filters.colors.includes(name);
            const disabled = cnt === 0 && !active;
            const isLight = ["White", "Yellow", "Beige"].includes(name);
            return (
              <button
                key={name}
                onClick={() => toggle("colors", name)}
                disabled={disabled}
                className={`group flex flex-col items-center gap-1.5 transition-opacity focus:outline-none ${
                  disabled
                    ? "opacity-30 cursor-not-allowed hover:opacity-30"
                    : "hover:opacity-80"
                }`}
                title={name}>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    active
                      ? "scale-110 shadow-md ring-2 ring-offset-2"
                      : "border border-gray-200 shadow-sm"
                  }`}
                  style={{
                    background:
                      name === "Multicolor"
                        ? "conic-gradient(red,orange,yellow,green,blue,purple,red)"
                        : hex,
                    "--tw-ring-color": active ? BRAND_PINK : "transparent",
                  }}>
                  {active && (
                    <CheckIcon
                      className={`w-4 h-4 stroke-2 ${isLight ? "text-gray-900" : "text-white"}`}
                    />
                  )}
                </span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest leading-none text-center truncate">
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </Accordion>

      {/* PRICE */}
      <Accordion
        title="Price"
        badge={filters.priceMin != null || filters.priceMax != null ? 1 : 0}>
        <div className="flex flex-col gap-3 mb-4">
          {PRICE_PRESETS.map((pr) => {
            const active =
              filters.priceMin === pr.min && filters.priceMax === pr.max;
            return (
              <button
                key={pr.label}
                onClick={() => setPrice(pr.min, pr.max)}
                className="flex items-center gap-3 text-left group focus:outline-none">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    active
                      ? "border-transparent"
                      : "border-gray-300 group-hover:border-gray-500"
                  }`}
                  style={active ? { background: BRAND_PINK } : {}}>
                  {active && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                {/* FIXED: Dynamic class name logic applied correctly */}
                <span
                  className={`text-[12px] tracking-wide transition-colors ${
                    active
                      ? "font-bold text-black"
                      : "text-gray-600 group-hover:text-black"
                  }`}>
                  {pr.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Range */}
        <div className="bg-gray-50 p-3 border border-gray-100">
          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
            Custom Range
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ₹
              </span>
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin ?? ""}
                onChange={(e) => setCustomPrice("priceMin", e.target.value)}
                className="w-full pl-6 pr-2 py-2 text-xs bg-white border border-gray-200 focus:outline-none focus:border-[#da127d] transition-colors"
              />
            </div>
            <span className="text-gray-300 text-xs flex-shrink-0">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ₹
              </span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax ?? ""}
                onChange={(e) => setCustomPrice("priceMax", e.target.value)}
                className="w-full pl-6 pr-2 py-2 text-xs bg-white border border-gray-200 focus:outline-none focus:border-[#da127d] transition-colors"
              />
            </div>
          </div>
        </div>
      </Accordion>

      {/* AVAILABILITY */}
      <Accordion title="Availability" badge={filters.inStock ? 1 : 0}>
        <button
          onClick={() => {
            const p = new URLSearchParams(sp);
            if (filters.inStock) p.delete("inStock");
            else p.set("inStock", "true");
            setSp(p);
          }}
          className="flex items-center gap-3 group focus:outline-none">
          <div
            className={`w-4 h-4 border flex items-center justify-center transition-colors ${
              filters.inStock
                ? "border-transparent"
                : "border-gray-300 group-hover:border-gray-500"
            }`}
            style={filters.inStock ? { background: BRAND_PINK } : {}}>
            {filters.inStock && (
              <CheckIcon className="w-3 h-3 text-white stroke-[3]" />
            )}
          </div>
          <span
            className={`text-[12px] tracking-wide transition-colors ${
              filters.inStock
                ? "font-bold text-black"
                : "text-gray-600 group-hover:text-black"
            }`}>
            In stock only
          </span>
        </button>
      </Accordion>
    </div>
  );
};

export default FilterBody;
