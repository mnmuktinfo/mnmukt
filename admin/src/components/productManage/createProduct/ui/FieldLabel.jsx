import React from "react";
const FieldLabel = ({ children, required, subtitle }) => (
  <div className="mb-1.5">
    <label className="block text-sm font-medium text-[#212121]">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {subtitle && (
      <p className="text-[12px] text-[#878787] mt-0.5">{subtitle}</p>
    )}
  </div>
);

export default FieldLabel;
