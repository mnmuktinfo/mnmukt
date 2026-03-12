import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  PieChart,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";

const AdminInquiryLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="h-screen bg-[#F1F3F6] flex flex-col lg:flex-row font-sans text-[#212121] overflow-hidden antialiased">
      {/* --- FLIPKART MOBILE HEADER (Solid Blue) --- */}
      <header className="lg:hidden bg-[#2874F0] h-14 border-b border-[#2874F0] flex items-center justify-between px-4 shrink-0 shadow-sm z-30 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 text-white hover:bg-white/10 rounded-md transition-colors"
            aria-label="Open Menu">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            {/* White logo box for mobile contrast */}
            <div className="h-7 w-7 bg-white rounded-sm flex items-center justify-center text-[#2874F0] font-black text-sm shadow-sm shrink-0">
              M
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              Mnmukt Store
            </span>
          </div>
        </div>
      </header>

      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- FLIPKART DESKTOP SIDEBAR (Clean White) --- */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.06)] lg:shadow-none 
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Identity Header (Desktop) */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0 bg-white">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 bg-[#2874F0] rounded-sm flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
                M
              </div>
              <div className="overflow-hidden">
                <span className="block font-bold text-[#212121] text-sm truncate leading-tight">
                  Mnmukt Store
                </span>
                <span className="text-[11px] font-bold text-[#878787] uppercase tracking-wider block mt-0.5">
                  Seller Hub
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 -mr-1.5 text-[#878787] hover:bg-[#F1F3F6] hover:text-[#212121] rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto px-3 bg-white">
            <p className="px-3 text-[10px] font-bold text-[#878787] uppercase tracking-wider mb-2">
              Main Menu
            </p>
            <NavItem to="/" icon={PieChart} label="Overview" />

            {/* Added Flipkart Orange Badge to this item */}
            <NavItem
              to="/customers/messages"
              icon={MessageSquare}
              label="Customer Inquiries"
              badge="3 New"
            />

            <NavItem
              to="/customers/lists"
              icon={Users}
              label="Customer Directory"
            />
          </nav>
        </div>

        {/* Global Settings & Exit */}
        <div className="p-3 mb-2 space-y-1 border-t border-gray-100 bg-[#F9FAFB]">
          <NavItem to="/settings" icon={Settings} label="Store Settings" />

          <Link
            to="/"
            title="Exit Seller Hub"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[#878787] hover:bg-[#F1F3F6] hover:text-[#212121] group">
            <LogOut
              size={20}
              className="shrink-0 group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-semibold">Exit to Website</span>
          </Link>
        </div>
      </aside>

      {/* --- MAIN DATA SURFACE --- */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F1F3F6]">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// --- HIGH-PERFORMANCE NAV COMPONENT ---
const NavItem = ({ icon: Icon, label, to, badge }) => {
  const location = useLocation();

  // Highlight active link accurately
  const isActive =
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      title={label}
      className={`
        flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors relative group
        ${
          isActive
            ? "bg-[#F4F8FF] text-[#2874F0]" // Light blue background for active
            : "text-[#878787] hover:bg-[#F1F3F6] hover:text-[#212121]" // Gray for inactive
        }
      `}>
      <div className="flex items-center gap-3">
        {/* Active Indicator Line (Flipkart Blue) */}
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#2874F0]" />
        )}

        <Icon
          size={20}
          className={`shrink-0 ${isActive ? "text-[#2874F0]" : "text-[#878787] group-hover:text-[#212121]"}`}
        />

        <span
          className={`text-sm font-medium ${isActive ? "font-bold text-[#2874F0]" : ""}`}>
          {label}
        </span>
      </div>

      {/* Flipkart Action Orange Badge */}
      {badge && (
        <span className="bg-[#FB641B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default AdminInquiryLayout;
