import React from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const Breadcrumb = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="px-6 lg:px-12 pt-6">
      <nav className="flex items-center flex-wrap gap-2 text-[10px] uppercase tracking-widest font-semibold text-gray-400">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <React.Fragment key={i}>
              {!isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-[#da127d] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-black">{item.label}</span>
              )}

              {!isLast && (
                <ChevronRightIcon className="w-3 h-3 text-gray-300 stroke-2" />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default Breadcrumb;
