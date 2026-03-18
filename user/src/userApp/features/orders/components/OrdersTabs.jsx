import React from "react";

const OrdersTabs = ({ activeTab, setActiveTab, counts }) => (
  <div className="flex gap-0 mb-6 border-b border-gray-100">
    {[
      { key: "all", label: "All Orders", count: counts.all },
      { key: "active", label: "Active", count: counts.active },
      { key: "cancelled", label: "Cancelled", count: counts.cancelled },
    ].map(({ key, label, count }) => (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={`relative pb-3 mr-8 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors ${
          activeTab === key
            ? "text-gray-900"
            : "text-gray-400 hover:text-gray-600"
        }`}>
        {label}
        {count > 0 && (
          <span
            className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === key
                ? "bg-[#da127d] text-white"
                : "bg-gray-100 text-gray-400"
            }`}>
            {count}
          </span>
        )}
        {activeTab === key && (
          <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#da127d]" />
        )}
      </button>
    ))}
  </div>
);

export default OrdersTabs;
