import React from "react";

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full px-4 py-2.5 border border-gray-300 rounded-sm text-[15px]
      text-[#212121] bg-white outline-none cursor-pointer
      focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all
      ${className}`}
    {...props}>
    {children}
  </select>
);

export default Select;
