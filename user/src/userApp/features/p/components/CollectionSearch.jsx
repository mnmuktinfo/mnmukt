import React from "react";
import {
  MagnifyingGlassIcon as Search,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";

const CollectionSearch = ({ value, sp, setSp, mobile = false }) => {
  const handleChange = (v) => {
    const p = new URLSearchParams(sp);
    if (v) p.set("search", v);
    else p.delete("search");
    setSp(p);
  };

  const clear = () => {
    const p = new URLSearchParams(sp);
    p.delete("search");
    setSp(p);
  };

  if (mobile) {
    return (
      <div className="lg:hidden mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none stroke-2" />

        <input
          value={value}
          placeholder="SEARCH..."
          onChange={(e) => handleChange(e.target.value)}
          className="w-full pl-11 pr-10 py-3.5 text-[11px] font-bold tracking-widest uppercase border border-gray-200 focus:outline-none focus:border-[#da127d] bg-gray-50 focus:bg-white transition-colors"
        />

        {value && (
          <button
            onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#da127d]">
            <X className="w-4 h-4 stroke-2" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="hidden lg:flex justify-end mb-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

        <input
          value={value}
          placeholder="Search..."
          onChange={(e) => handleChange(e.target.value)}
          className="pl-9 pr-8 py-2 text-[12px] font-bold uppercase tracking-widest border-b border-gray-200 focus:outline-none focus:border-[#da127d] w-[220px] bg-transparent"
        />

        {value && (
          <button
            onClick={clear}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black">
            <X className="w-3.5 h-3.5 stroke-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CollectionSearch;
