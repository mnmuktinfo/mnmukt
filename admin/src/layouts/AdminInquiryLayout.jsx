import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  FaChartPie,
  FaRegCommentDots,
  FaUserGroup,
  FaSliders,
  FaArrowLeft,
} from "react-icons/fa6"; // Fa6 for high-precision icons

const AdminInquiryLayout = () => {
  return (
    <div className="h-screen bg-white flex font-sans text-slate-950 overflow-hidden">
      {/* --- ARCHITECTURAL SIDEBAR --- */}
      <aside className="w-20 lg:w-64 bg-slate-50 border-r border-slate-100 flex flex-col justify-between shrink-0 transition-all duration-500">
        <div>
          {/* Mnmukt Identity HUD */}
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100">
            <div className="h-9 w-9 bg-slate-950 rounded-sm flex items-center justify-center text-white font-black italic font-serif text-xl">
              M.
            </div>
            <div className="ml-4 hidden lg:block">
              <span className="block font-black text-[10px] uppercase tracking-[0.3em] leading-none">
                Command
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic font-serif">
                Registry
              </span>
            </div>
          </div>

          {/* Navigation Engine */}
          <nav className="p-3 space-y-2 mt-6">
            <NavItem to="/" icon={<FaChartPie size={18} />} label="Overview" />
            <NavItem
              to="/customers/messages"
              icon={<FaRegCommentDots size={18} />}
              label="Inquiries"
            />
            <NavItem
              to="/customers/lists"
              icon={<FaUserGroup size={18} />}
              label="Customers"
            />
          </nav>
        </div>

        {/* Global Control HUD */}
        <div className="p-3 mb-6 space-y-2">
          <NavItem
            to="/settings"
            icon={<FaSliders size={18} />}
            label="Settings"
          />
          <Link
            to="/"
            className="flex items-center gap-4 px-4 py-3 mx-2 text-slate-400 hover:text-slate-950 transition-all group">
            <FaArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
              Exit Hub
            </span>
          </Link>
        </div>
      </aside>

      {/* --- DATA SURFACE --- */}
      <main className="flex-1 flex overflow-hidden relative bg-white animate-in fade-in duration-1000">
        <Outlet />
      </main>
    </div>
  );
};

// High-Performance Nav Component
const NavItem = ({ icon, label, to }) => {
  const location = useLocation();

  // Logic for root-based active states (Since we removed /admin)
  const isActive =
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-4 px-4 py-3.5 mx-2 rounded-sm cursor-pointer transition-all duration-300 group active:scale-[0.97]
        ${
          isActive
            ? "bg-slate-950 text-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)]"
            : "text-slate-400 hover:bg-white hover:text-slate-950 border border-transparent hover:border-slate-100"
        }
      `}>
      <div
        className={`transition-colors duration-300 ${isActive ? "text-[#ff356c]" : "group-hover:text-slate-950"}`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden lg:block">
        {label}
      </span>

      {/* Active Indicator Dot */}
      {isActive && (
        <div className="ml-auto w-1 h-1 rounded-full bg-[#ff356c] hidden lg:block" />
      )}
    </Link>
  );
};

export default AdminInquiryLayout;
