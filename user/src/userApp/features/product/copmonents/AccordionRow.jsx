import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

const AccordionRow = ({ label, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none group">
        <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
          {label}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
        }`}>
        <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export default AccordionRow;
