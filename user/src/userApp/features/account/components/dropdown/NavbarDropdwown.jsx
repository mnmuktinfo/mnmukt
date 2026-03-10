import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  X,
  ChevronRight,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Home,
  Package,
  Heart,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../../../auth/context/UserContext";

const NavbarDropdown = ({ isOpen, onClose, menuItems = [] }) => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/");
  };

  const BRAND_PINK = "#ff356c";

  return createPortal(
    <div
      className={`fixed  w-full inset-0 z-10000 ${isOpen ? "visible" : "invisible"}`}>
      {/* 1. Transparent Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 2. Minimalist Side Drawer */}
      <aside
        className={`absolute top-0 left-0 h-full w-[100%] max-w-[520px] bg-white flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        {/* --- A. THE HEADER (Editorial Style) --- */}
        <div className="px-8 pt-16 pb-10 border-b border-slate-50 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-[#ff356c] transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="flex flex-col gap-6">
            <div className="w-16 h-16 rounded-full border border-slate-100 p-1">
              <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center overflow-hidden">
                {isLoggedIn && user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={24} strokeWidth={1} className="text-slate-300" />
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">
                Identity
              </p>
              {isLoggedIn ? (
                <h2 className="text-2xl font-light tracking-tighter text-slate-900">
                  {user?.name?.split(" ")[0] || "User"}{" "}
                  <span className="italic font-serif text-[#ff356c]">.</span>
                </h2>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    navigate("/auth/login");
                  }}
                  className="text-2xl font-light tracking-tighter text-slate-900 flex items-center gap-2 group">
                  Authenticate{" "}
                  <ChevronRight
                    size={18}
                    className="text-[#ff356c] group-hover:translate-x-1 transition-transform"
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- B. NAVIGATION MENU --- */}
        <div className="flex-1 overflow-y-auto py-8 px-4">
          <div className="mb-10">
            <h3 className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-6">
              Navigation
            </h3>
            <ul className="space-y-1">
              {[
                { label: "Home", icon: Home, path: "/" },
                { label: "Archive", icon: LayoutGrid, path: "/categories" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(item.path);
                    }}
                    className="w-full flex items-center gap-6 px-4 py-4 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors">
                    <item.icon
                      size={18}
                      strokeWidth={1.2}
                      className="text-slate-300"
                    />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-6">
              Collections
            </h3>
            <ul className="space-y-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center justify-between px-4 py-4 text-sm tracking-tight transition-all
                      ${isActive ? "text-[#ff356c] font-bold" : "text-slate-600 font-medium"}
                    `}>
                    {item.label}
                    <div
                      className={`w-1 h-1 rounded-full bg-[#ff356c] transition-opacity ${item.isActive ? "opacity-100" : "opacity-0"}`}
                    />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-6">
              Activity
            </h3>
            <ul className="space-y-1">
              {[
                { label: "Orders", icon: Package, path: "/user/profile" },
                { label: "Wishlist", icon: Heart, path: "/wishlist" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(item.path);
                    }}
                    className="w-full flex items-center gap-6 px-4 py-4 text-sm font-medium text-slate-600 hover:text-slate-950 group">
                    <item.icon
                      size={18}
                      strokeWidth={1.2}
                      className="text-slate-300 group-hover:text-[#ff356c] transition-colors"
                    />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- C. THE FOOTER (HUD Style) --- */}
        <div className="p-8 border-t border-slate-50">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => {
                onClose();
                navigate("/contact-us");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors">
              <HelpCircle size={14} /> Concierge
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("/settings");
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors">
              <Settings size={14} /> System
            </button>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full py-5 text-[10px] font-black text-center text-[#ff356c] border border-red-50 bg-red-50/20 uppercase tracking-[0.4em] transition-all hover:bg-red-50">
              De-Authenticate
            </button>
          ) : (
            <div className="flex flex-col items-center opacity-20">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.8em]">
                MNMUKT
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
};

export default NavbarDropdown;
