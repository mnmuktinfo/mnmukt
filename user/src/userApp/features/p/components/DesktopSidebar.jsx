import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import React from "react";
import countActive from "../utils/countActive";
import FilterBody from "../FilterBody";
const BRAND_PINK = "#da127d";

const DesktopSidebar = ({ facets, filters, setSp }) => {
  const cnt = countActive(filters);
  return (
    <aside className="hidden lg:block w-[240px] xl:w-[260px] flex-shrink-0 mr-12">
      <div className="sticky top-28 border border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500 stroke-2" />
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-black">
              Filters
            </span>
            {cnt > 0 && (
              <span
                className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none shadow-sm"
                style={{ background: BRAND_PINK }}>
                {cnt}
              </span>
            )}
          </div>
          {cnt > 0 && (
            <button
              onClick={() => setSp({})}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#da127d] transition-colors">
              Clear all
            </button>
          )}
        </div>
        <div className="py-2">
          <FilterBody facets={facets} />
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
