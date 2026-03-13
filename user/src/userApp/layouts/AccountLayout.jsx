import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const AccountLayout = () => {
  const location = useLocation();

  // Helper to generate a simple breadcrumb label
  const getPageLabel = () => {
    const path = location.pathname;
    if (path.includes("edit")) return "Edit Profile";
    if (path.includes("orders")) return "Order History";
    if (path.includes("addresses")) return "Saved Addresses";
    return "My Account";
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      {/* 1. BRAND ACCENT BAR */}
      <div className="h-1 w-full bg-[#007673]" />

      {/* 2. CONTEXTUAL BREADCRUMBS (Desktop only for clean look) */}
      <nav className="max-w-5xl mx-auto w-full px-6 pt-8 hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        <Link
          to="/"
          className="hover:text-[#007673] transition-colors flex items-center gap-1">
          <Home size={12} />
        </Link>
        <ChevronRight size={12} />
        <Link
          to="/user/profile"
          className="hover:text-[#007673] transition-colors">
          Account
        </Link>
        {location.pathname !== "/user/profile" && (
          <>
            <ChevronRight size={12} />
            <span className="text-gray-900">{getPageLabel()}</span>
          </>
        )}
      </nav>

      {/* 3. MAIN CONTENT CARRIER */}
      <main className="max-w-5xl mx-auto w-full flex-1 py-6 md:py-8 px-4 sm:px-6">
        <div className="animate-in fade-in duration-700">
          <Outlet />
        </div>
      </main>

      {/* 4. PREMIUM MINIMALIST FOOTER */}
      <footer className="w-full bg-white border-t border-gray-200 mt-12 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Brand Logo/Name */}
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[14px] font-black uppercase tracking-[0.5em] text-gray-900">
                Mnmukt
              </span>
              <span className="text-[9px] font-bold text-[#007673] uppercase tracking-widest mt-1">
                Organics & Lifestyle
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <button className="hover:text-[#007673] transition-colors">
                Help Center
              </button>
              <button className="hover:text-[#007673] transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-[#007673] transition-colors">
                Terms of Service
              </button>
              <button className="hover:text-[#007673] transition-colors">
                Shipping Info
              </button>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-gray-400 font-medium">
              © 2026 Mnmukt Organics Private Limited.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-4 w-px bg-gray-200 hidden md:block" />
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">
                Secured by AES-256 Encryption
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccountLayout;
