import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

const AdminOrderLayout = () => {
  const location = useLocation();

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white">
      {/* SIMPLE TOP NAVBAR */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-10">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Order Manager
          </h1>

          <div className="flex items-center gap-1">
            <Link
              to="/admin/orders"
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                isActive("/admin/orders")
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              All Orders
            </Link>

            <Link
              to="/admin/orders/pending"
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                isActive("/admin/orders/pending")
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              Pending
            </Link>

            <Link
              to="/admin/orders/returns"
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                isActive("/admin/orders/returns")
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              Returns
            </Link>
          </div>
        </div>

        {/* QUICK ACTION */}
        <button className="bg-black text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-sm">
          + Create Order
        </button>
      </nav>

      {/* PAGE CONTENT */}
      <main className="p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminOrderLayout;
