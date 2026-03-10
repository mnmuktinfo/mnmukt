import React from "react";
import { Search, User } from "lucide-react";

const AdminHeader = () => {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg w-72">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search anything…"
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3">
        <User className="text-gray-600" size={22} />
        <span className="text-sm font-medium text-gray-700">Admin</span>
      </div>
    </header>
  );
};

export default AdminHeader;
