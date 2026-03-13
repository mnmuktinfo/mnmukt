import React from "react";

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-4 py-3 border border-gray-300 rounded-sm text-[15px]
      text-[#212121] placeholder:text-[#878787] bg-white outline-none resize-none
      focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all
      ${className}`}
    {...props}
  />
);

export default Textarea;
