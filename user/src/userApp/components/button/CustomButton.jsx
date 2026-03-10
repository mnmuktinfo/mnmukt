import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const CustomButton = forwardRef(
  (
    {
      text,
      icon,
      loading = false,
      disabled = false,
      onClick,
      variant = "primary", // Options: 'primary', 'secondary', 'outline', 'ghost'
      fullWidth = true,
      type = "button",
      className = "",
      ...props
    },
    ref,
  ) => {
    // 1. Define Design Variants
    const variants = {
      primary:
        "bg-gray-900 text-white hover:bg-black border border-transparent shadow-lg shadow-gray-200",
      secondary:
        "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
      outline:
        "bg-transparent text-gray-900 border-2 border-gray-900 hover:bg-gray-50",
      ghost:
        "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100/50",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100",
    };

    // 2. Base Styles
    const baseStyles = `
      relative 
      flex items-center justify-center gap-2.5 
      px-6 py-3.5 
      text-sm font-bold tracking-wide uppercase 
      transition-all duration-300 ease-out 
      active:scale-[0.97] 
      disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100
    `;

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variants[variant] || variants.primary} 
          ${fullWidth ? "w-full" : "w-auto inline-flex"}
          ${className}
        `}
        {...props}>
        {/* Loading Spinner */}
        {loading && (
          <Loader2
            size={18}
            className="animate-spin absolute left-1/2 -ml-[9px]" // Center absolutely so text doesn't jump
          />
        )}

        {/* Content (Hidden when loading to preserve width) */}
        <span
          className={`flex items-center gap-2.5 ${loading ? "opacity-0" : "opacity-100"}`}>
          {icon && <span className="shrink-0">{icon}</span>}
          {text}
        </span>
      </button>
    );
  },
);

CustomButton.displayName = "CustomButton";

export default CustomButton;
