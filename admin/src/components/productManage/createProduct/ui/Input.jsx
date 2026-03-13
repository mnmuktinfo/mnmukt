import React from "react";

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-4 py-2.5 border border-gray-300 rounded-sm text-[15px]
      text-[#212121] placeholder:text-[#878787] bg-white outline-none
      focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20
      transition-all disabled:bg-[#f9fafb] disabled:text-gray-500 ${className}`}
    {...props}
  />
));

export default Input;
