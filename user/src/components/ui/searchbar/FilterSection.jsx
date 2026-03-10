import React from "react";

const FilterSection = ({ title, children }) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export default FilterSection;
