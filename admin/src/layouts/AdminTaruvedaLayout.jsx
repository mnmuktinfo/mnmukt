import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Menu,
  X,
  Leaf,
  Bell,
  UserCircle,
} from "lucide-react";
import { BiAddToQueue } from "react-icons/bi";

export default function AdminTaruvedaLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/taruveda" },
    { name: "Products", icon: Package, path: "/taruveda/products" },
    { name: "Add Product", icon: BiAddToQueue, path: "/taruveda/products/new" },
    { name: "Orders", icon: ShoppingCart, path: "/taruveda/orders" },
    { name: "Settings", icon: Settings, path: "/taruveda/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#F1F3F6] overflow-hidden font-sans">
      {/* --- TOP NAVBAR --- */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#2874F0] text-white z-[60] flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#FFE500]" />
            <span className="text-lg font-bold italic">
              Taruveda{" "}
              <span className="text-xs not-italic opacity-80">Seller Hub</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 cursor-pointer opacity-90 hover:opacity-100" />
          <div className="h-8 w-[1px] bg-blue-400 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-2 cursor-pointer">
            <UserCircle className="w-6 h-6" />
            <span className="hidden sm:block text-xs font-bold uppercase">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#212121] text-gray-400 transform transition-transform duration-300 pt-14 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <nav className="py-6 flex flex-col h-full">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 transition-colors relative ${isActive ? "bg-black text-white" : "hover:bg-black/50 hover:text-white"}`}>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFE500]" />
                )}
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-[#FFE500]" : "text-gray-500"}`}
                />
                <span className="text-sm font-semibold">{item.name}</span>
              </Link>
            );
          })}

          <div className="mt-auto p-4 border-t border-gray-800">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 text-[11px] font-bold border border-gray-700 rounded text-gray-400 hover:bg-gray-800 uppercase tracking-wider">
              <Leaf className="w-4 h-4 text-green-500" /> View Store
            </Link>
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col pt-14 overflow-hidden relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
