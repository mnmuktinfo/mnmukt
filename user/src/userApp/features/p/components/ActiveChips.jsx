import React from "react";
import { useSearchParams } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toggleParam } from "../utils/filterUtils";

const ActiveChips = ({ filters }) => {
  const [sp, setSp] = useSearchParams();

  const chips = [
    ...(filters.sizes ?? []).map((s) => ({
      label: s,
      rm: () => setSp(toggleParam(sp, "sizes", s)),
    })),
    ...(filters.colors ?? []).map((c) => ({
      label: c,
      rm: () => setSp(toggleParam(sp, "colors", c)),
    })),
    ...(filters.priceMin != null || filters.priceMax != null
      ? [
          {
            label: `₹${filters.priceMin ?? 0}–${
              filters.priceMax ? "₹" + filters.priceMax : "∞"
            }`,
            rm: () => {
              const p = new URLSearchParams(sp);
              p.delete("priceMin");
              p.delete("priceMax");
              setSp(p);
            },
          },
        ]
      : []),
    ...(filters.inStock
      ? [
          {
            label: "In stock",
            rm: () => {
              const p = new URLSearchParams(sp);
              p.delete("inStock");
              setSp(p);
            },
          },
        ]
      : []),
    ...(filters.search
      ? [
          {
            label: `"${filters.search}"`,
            rm: () => {
              const p = new URLSearchParams(sp);
              p.delete("search");
              setSp(p);
            },
          },
        ]
      : []),
  ];

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border border-gray-200 bg-white shadow-sm text-black transition-colors hover:border-[#da127d]">
          {chip.label}
          <button
            onClick={chip.rm}
            className="text-gray-400 group-hover:text-[#da127d] transition-colors focus:outline-none">
            <XMarkIcon className="w-3.5 h-3.5 stroke-2" />
          </button>
        </span>
      ))}
      <button
        onClick={() => setSp({})}
        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#da127d] transition-colors ml-2 focus:outline-none">
        Clear all
      </button>
    </div>
  );
};

export default ActiveChips;
