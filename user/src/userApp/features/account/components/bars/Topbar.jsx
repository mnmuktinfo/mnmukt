import React from "react";
import { Bell, UserCircle } from "lucide-react";

const Topbar = () => {
  return (
    <div className="bg-white shadow px-6 py-3 flex items-center justify-between">
      {/* Left: Page Title (can be dynamic later) */}
      <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>

      {/* Right: Actions */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600 hover:text-blue-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-500">
          <UserCircle className="w-8 h-8 text-gray-600" />
          <span className="hidden md:inline text-gray-700 font-medium">
            Admin
          </span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
