import React from "react";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white border border-gray-200 rounded-sm p-5 flex items-center gap-4 shadow-sm">
    <div
      className={`w-11 h-11 rounded-sm flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

export default StatCard;
