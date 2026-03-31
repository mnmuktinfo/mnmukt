import React, { useState } from "react";
import FilterBody from "../FilterBody";
import { BRAND_PINK } from "../constants/filters";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

/* Count active filters */
const getActiveCount = (filters) => {
  if (!filters) return 0;

  return (
    (filters.sizes?.length || 0) +
    (filters.colors?.length || 0) +
    (filters.priceMin != null || filters.priceMax != null ? 1 : 0) +
    (filters.inStock ? 1 : 0)
  );
};

const MobileFilterSheet = ({ facets, filters, onClose, setSp }) => {
  const cnt = getActiveCount(filters);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      {/* Sidebar */}
      <div
        className="relative w-[92%] max-w-[420px] bg-white h-full flex flex-col shadow-2xl"
        style={{
          animation: "slideLeft 0.35s cubic-bezier(.16,1,.3,1)",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-bold tracking-[0.15em] uppercase">
              Filters
            </h2>

            {cnt > 0 && (
              <span
                className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                style={{ background: BRAND_PINK }}>
                {cnt}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black">
            <XMarkIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Size Guide */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-50">
              <span className="text-[11px] font-semibold uppercase tracking-widest">
                Size Guide
              </span>

              <ChevronDownIcon
                className={`w-4 h-4 transition ${
                  sizeGuideOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sizeGuideOpen && (
              <div className="p-4 text-[12px] text-gray-500">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b text-gray-400 uppercase text-[10px] tracking-widest">
                      <th className="py-2">Size</th>
                      <th className="py-2">Chest</th>
                      <th className="py-2">Waist</th>
                    </tr>
                  </thead>

                  <tbody>
                    {["XS", "S", "M", "L", "XL"].map((size) => (
                      <tr key={size} className="border-b last:border-0">
                        <td className="py-3 font-medium">{size}</td>
                        <td className="py-3 text-gray-400">
                          {size === "M" ? '38-40"' : "..."}
                        </td>
                        <td className="py-3 text-gray-400">
                          {size === "M" ? '32-34"' : "..."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Filters */}
          <FilterBody facets={facets} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-5 space-y-3">
          {cnt > 0 && (
            <button
              onClick={() => setSp({})}
              className="w-full py-3 text-[11px] font-semibold uppercase tracking-widest border rounded-lg">
              Clear Filters
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-[12px] font-bold uppercase tracking-widest text-white rounded-lg"
            style={{ background: BRAND_PINK }}>
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterSheet;
