import React from "react";

const HomePageSetupSidebar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
        <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-[#B4292F] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default HomePageSetupSidebar;
