import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export const Accordion = ({
  title,
  badge = 0,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left group focus:outline-none">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-black group-hover:text-[#da127d] transition-colors">
          {title}
          {badge > 0 && (
            <span
              className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none shadow-sm"
              style={{ background: "#da127d" }} // Fallback if BRAND_PINK isn't passed down, but ideally use your constant
            >
              {badge}
            </span>
          )}
        </span>
        <span className="text-gray-400 group-hover:text-[#da127d] transition-colors flex-shrink-0">
          {open ? (
            <ChevronUpIcon className="w-3.5 h-3.5 stroke-2" />
          ) : (
            <ChevronDownIcon className="w-3.5 h-3.5 stroke-2" />
          )}
        </span>
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
};
