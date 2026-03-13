import React from "react";

const Card = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-white">
      {Icon && <Icon size={18} className="text-[#2874F0] shrink-0" />}
      <h2 className="text-base font-medium text-[#212121]">{title}</h2>
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

export default Card;
