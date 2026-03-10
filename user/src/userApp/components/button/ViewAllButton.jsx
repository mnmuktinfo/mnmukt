import React from "react";
import { ChevronRight } from "lucide-react";

const ViewAllButton = ({
  label = "View All",
  onClick,
  loading = false,
  disabled = false,
  bgColor = "#ff356c",
  hoverBgColor = "#e62e5f",
  textColor = "white",
  fullWidth = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${fullWidth ? "w-full" : "inline-flex"}
        flex items-center justify-center gap-2 px-4 md:px-6 py-2.5  font-medium
        transition-all duration-300
        ${
          !disabled
            ? `bg-[${bgColor}] hover:bg-[${hoverBgColor}]`
            : "opacity-50 cursor-not-allowed"
        }
        text-${textColor}
        ${className}
      `}>
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {label}
        </div>
      ) : (
        <>
          {label}
          <ChevronRight
            size={16}
            className="transform transition-transform duration-300 group-hover:translate-x-1"
          />
        </>
      )}
    </button>
  );
};

export default ViewAllButton;
