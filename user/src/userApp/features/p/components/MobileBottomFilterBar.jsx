import React from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";

const MobileBottomFilterBar = ({
  filterCount = 0,
  sort = "newest",
  onOpenFilter,
  onOpenSort,
}) => {
  const sortActive = sort !== "newest";

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
      {/* FILTER */}
      <button
        onClick={onOpenFilter}
        className="flex-1 flex items-center justify-center gap-2.5 py-4 border-r border-gray-200 active:bg-gray-50 transition group">
        <div className="relative flex items-center justify-center">
          <AdjustmentsHorizontalIcon
            className={`w-5 h-5 stroke-2 transition ${
              filterCount > 0
                ? "text-[#da127d]"
                : "text-gray-500 group-hover:text-black"
            }`}
          />

          {filterCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-[#da127d] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
              {filterCount}
            </span>
          )}
        </div>

        <span
          className={`text-[12px] font-bold uppercase tracking-[0.15em] ${
            filterCount > 0
              ? "text-[#da127d]"
              : "text-gray-700 group-hover:text-black"
          }`}>
          Filter
        </span>
      </button>

      {/* SORT */}
      <button
        onClick={onOpenSort}
        className="flex-1 flex items-center justify-center gap-2.5 py-4 active:bg-gray-50 transition group">
        <div className="relative flex items-center justify-center">
          <ArrowsUpDownIcon
            className={`w-5 h-5 stroke-2 transition ${
              sortActive
                ? "text-[#da127d]"
                : "text-gray-500 group-hover:text-black"
            }`}
          />

          {sortActive && (
            <span className="absolute -top-0.5 -right-1.5 w-2 h-2 bg-[#da127d] rounded-full border border-white" />
          )}
        </div>

        <span
          className={`text-[12px] font-bold uppercase tracking-[0.15em] ${
            sortActive
              ? "text-[#da127d]"
              : "text-gray-700 group-hover:text-black"
          }`}>
          Sort
        </span>
      </button>
    </div>
  );
};

export default MobileBottomFilterBar;
