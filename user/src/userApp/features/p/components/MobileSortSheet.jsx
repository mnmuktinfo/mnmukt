import React from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { BRAND_PINK, SORT_OPTIONS } from "../constants/filters";

const MobileSortSheet = ({ sort, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[210] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="relative w-[92%] max-w-[380px] bg-white h-full shadow-2xl flex flex-col"
        style={{
          animation: "slideLeft 0.35s cubic-bezier(.16,1,.3,1)",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[14px] font-bold tracking-[0.15em] uppercase">
            Sort By
          </h2>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black transition">
            <XMarkIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto">
          {SORT_OPTIONS.map((opt) => {
            const active = sort === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-6 py-5 border-b border-gray-100 transition hover:bg-gray-50 ${
                  active ? "bg-pink-50/40" : ""
                }`}>
                <span
                  className={`text-[13px] uppercase tracking-wide ${
                    active ? "font-bold" : "font-medium text-gray-500"
                  }`}
                  style={active ? { color: BRAND_PINK } : {}}>
                  {opt.label}
                </span>

                {active && (
                  <CheckIcon
                    className="w-5 h-5 stroke-[2.5]"
                    style={{ color: BRAND_PINK }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileSortSheet;
