import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const AccordionRow = ({ label, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-5 flex items-center justify-between text-left group focus:outline-none transition-colors"
        aria-expanded={open}>
        <span className="text-[15px] font-bold text-gray-900 uppercase tracking-widest group-hover:text-[#ff3f6c] transition-colors">
          {label}
        </span>

        {/* Subtle circular background for the icon on hover */}
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
            open
              ? "bg-pink-50 text-[#ff3f6c]"
              : "bg-gray-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900"
          }`}>
          <ChevronDown
            size={18}
            strokeWidth={2.5}
            className={`transition-transform duration-300 ${
              open ? "-rotate-180" : "rotate-0"
            }`}
          />
        </span>
      </button>

      {/* Modern CSS Grid trick for buttery smooth, dynamic auto-height animation */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}>
        <div className="overflow-hidden">
          <div className="pb-6 pt-1 text-[14px] text-gray-600 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionRow;
