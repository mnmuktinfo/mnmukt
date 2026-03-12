import React from "react";

const StatusPill = ({ isActive }) => (
  <span
    className={`px-2 py-1 text-xs rounded-full font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
    {isActive ? "Live" : "Draft"}
  </span>
);

export default StatusPill;
