import React, { useRef, useEffect, useState } from "react";
import {
  Squares2X2Icon,
  Bars3Icon,
  Bars4Icon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { SORT_OPTIONS, BRAND_PINK } from "../constants/filters";
import HighlightedTitle from "./HighlightedTitle";

const CollectionToolbar = ({ title, gridCols, setGridCols, sort, setSort }) => {
  const [open, setOpen] = useState(false);
  const sortRef = useRef(null);

  const sortLabel = SORT_OPTIONS.find((s) => s.value === sort)?.label || "Sort";

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const gridOptions = [
    { cols: 2, Icon: Squares2X2Icon },
    { cols: 3, Icon: Bars3Icon },
    { cols: 4, Icon: Bars4Icon },
  ];

  return (
    <div className=" flex items-center justify-between border-y border-gray-200 bg-white h-[60px] mb-8">
      <HighlightedTitle
        text={title}
        className="flex md:hidden  justify-start mb-2"
      />

      {/* GRID SWITCH */}
      <div className="flex items-center gap-6 px-6 border-r border-gray-200 h-full">
        {gridOptions.map(({ cols, Icon }) => {
          const active = gridCols === cols;

          return (
            <button
              key={cols}
              onClick={() => setGridCols(cols)}
              className={`transition-colors ${
                active ? "text-black" : "text-gray-300 hover:text-gray-600"
              }`}>
              <Icon className="w-5 h-5 stroke-2" />
            </button>
          );
        })}
      </div>

      <HighlightedTitle
        text={title}
        className="hidden md:flex justify-start mb-2"
      />

      {/* SORT */}
      <div
        ref={sortRef}
        className="hidden px-6 border-l border-gray-200 h-full relative md:flex items-center">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:text-[#da127d]">
          {sortLabel}
          <ChevronDownIcon
            className={`w-3.5 h-3.5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full bg-white border border-gray-200 shadow-xl w-[240px] z-30 py-2">
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSort(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-[11px] uppercase tracking-widest ${
                    active
                      ? "text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-black"
                  }`}
                  style={active ? { background: BRAND_PINK } : {}}>
                  {opt.label}

                  {active && <CheckIcon className="w-4 h-4 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionToolbar;
