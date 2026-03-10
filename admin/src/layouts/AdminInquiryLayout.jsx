import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  PieChart,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

const AdminInquiryLayout = () => {
  return (
    <div className="h-screen bg-[#F1F3F6] flex font-sans text-[#212121] overflow-hidden antialiased">
      {/* --- FLIPKART STYLE SIDEBAR --- */}
      <aside className="w-[72px] lg:w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-sm z-20 transition-all duration-300">
        <div className="flex flex-col h-full">
          {/* Brand Identity Header */}
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100 shrink-0">
            <div className="h-9 w-9 bg-[#2874F0] rounded-sm flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
              M
            </div>
            <div className="ml-3 hidden lg:block overflow-hidden">
              <span className="block font-bold text-gray-900 text-sm truncate leading-tight">
                Mnmukt Store
              </span>
              <span className="text-[11px] font-bold text-[#878787] uppercase tracking-wider block mt-0.5">
                Seller Hub
              </span>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
            <p className="px-6 text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-2 hidden lg:block">
              Main Menu
            </p>
            <NavItem to="/" icon={PieChart} label="Overview" />
            <NavItem
              to="/customers/messages"
              icon={MessageSquare}
              label="Customer Inquiries"
            />
            <NavItem
              to="/customers/lists"
              icon={Users}
              label="Customer Directory"
            />
          </nav>
        </div>

        {/* Global Settings & Exit */}
        <div className="p-3 mb-2 space-y-1 border-t border-gray-100 bg-gray-50/50">
          <NavItem to="/settings" icon={Settings} label="Store Settings" />

          <Link
            to="/"
            title="Exit Seller Hub"
            className="flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-3 lg:py-2.5 rounded-lg lg:rounded-sm transition-colors text-gray-500 hover:bg-gray-200 hover:text-gray-900 group">
            <LogOut
              size={20}
              className="shrink-0 group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-semibold hidden lg:block">
              Exit to Website
            </span>
          </Link>
        </div>
      </aside>

      {/* --- MAIN DATA SURFACE --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F1F3F6]">
        <div className="flex-1 overflow-y-auto">
          {/* This Outlet renders the nested pages (like AdminCustomers) */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- HIGH-PERFORMANCE NAV COMPONENT ---
const NavItem = ({ icon: Icon, label, to }) => {
  const location = useLocation();

  // Highlight active link accurately
  const isActive =
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      title={label} // Helpful tooltip when sidebar is collapsed
      className={`
        flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-6 py-3.5 lg:py-3 
        mx-2 lg:mx-0 rounded-lg lg:rounded-none transition-colors relative group
        ${
          isActive
            ? "bg-[#f4f8ff] lg:bg-blue-50/50 text-[#2874F0]"
            : "text-[#666666] hover:bg-gray-100 hover:text-gray-900"
        }
      `}>
      {/* Active Indicator Line (Desktop only) */}
      {isActive && (
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-[#2874F0]" />
      )}

      <Icon
        size={20}
        className={`shrink-0 ${isActive ? "text-[#2874F0]" : "text-gray-400 group-hover:text-gray-700"}`}
      />

      <span
        className={`text-sm font-medium hidden lg:block ${isActive ? "font-bold text-[#2874F0]" : ""}`}>
        {label}
      </span>
    </Link>
  );
};

export default AdminInquiryLayout;
