import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";

const AccountSidebar = ({ menuItems = [], onLogout }) => {
  const location = useLocation();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      {/* MENU LIST */}
      <nav className="p-2">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.link;
          const Icon = item.icon;

          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-red-50 border border-red-200"
                  : "hover:bg-gray-50"
              }`}>
              <div className="flex items-center space-x-3">
                {/* ICON WRAPPER */}
                <div
                  className={`p-2 rounded-lg transition ${
                    isActive
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                  <Icon size={18} />
                </div>

                {/* LABELS */}
                <div>
                  <h3
                    className={`font-medium ${
                      isActive ? "text-red-700" : "text-gray-800"
                    }`}>
                    {item.label}
                  </h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>

              <ChevronRight
                size={18}
                className={isActive ? "text-red-600" : "text-gray-400"}
              />
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition duration-200">
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AccountSidebar;
