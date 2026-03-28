import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  User,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Droplets,
  Wheat,
  Sprout,
  Gift,
} from "lucide-react";

// Adjust these import paths to match your project structure
import { useAuth } from "../../auth/context/UserContext";
import { useCart } from "../../../context/TaruvedaCartContext";

export default function TaruVedaHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Consume real contexts instead of mock state
  const { user } = useAuth();
  const { totalItems } = useCart();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle sticky header shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ─── 1. Announcement Bar ─────────────────────────── */}
      <div className="w-full bg-[#112315] text-[#f4fbf2] text-[10px] sm:text-xs font-bold py-2.5 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-center uppercase tracking-widest z-50 relative">
        <p className="opacity-90">
          We're excited to announce that our International Store is now live!
        </p>
        <p className="hidden md:block text-[#8CC63F]">
          Shop with global shipping ✈️
        </p>
      </div>

      {/* ─── Main Sticky Container ───────────────────────── */}
      <header
        className={`sticky top-0 w-full z-40 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
        }`}>
        {/* ─── 2. Top Bar (Search, Logo, Icons) ────────── */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? "py-3" : "py-5 sm:py-6"}`}>
            {/* Left: Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1">
              <div className="relative w-full max-w-[320px] group">
                <input
                  type="text"
                  placeholder="Search for organic essentials..."
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-full py-2.5 pl-5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#429828] focus:ring-1 focus:ring-[#429828] focus:bg-white transition-all"
                />
                <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#429828] transition-all focus:outline-none">
                  <Search size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Left: Mobile Hamburger */}
            <div className="flex flex-1 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-gray-700 hover:text-[#429828] transition-colors focus:outline-none rounded-full hover:bg-gray-50">
                <Menu size={24} strokeWidth={2} />
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex flex-1 justify-center flex-col items-center select-none">
              <Link
                to="/taruveda-organic-shampoo-oil"
                className="flex flex-col items-center group">
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#112315] group-hover:text-[#2C3E30] transition-colors"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  TARUVEDA
                </h1>
                <span className="text-[9px] sm:text-[10px] tracking-[0.3em] text-[#429828] font-bold uppercase mt-1">
                  Organic Farms
                </span>
              </Link>
            </div>

            {/* Right: Action Icons */}
            <div className="flex flex-1 justify-end items-center gap-3 sm:gap-5">
              {/* User Profile / Login */}
              {user ? (
                <Link
                  to="/user/profile"
                  className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-[#429828] transition-all group">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f4fbf2] border border-[#429828]/20 group-hover:bg-[#429828] group-hover:text-white transition-colors text-[#429828] font-bold text-sm">
                    {user?.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className="hidden lg:block text-xs font-bold uppercase tracking-widest truncate max-w-[80px]">
                    {user?.name ? user.name.split(" ")[0] : "Profile"}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/auth/login"
                  className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-gray-700 hover:text-[#429828] hover:bg-[#f4fbf2] transition-all focus:outline-none">
                  <User size={22} strokeWidth={1.5} />
                </Link>
              )}

              {/* Live Cart Count Redirecting to specific URL */}
              <Link
                to="/taruveda-organic-shampoo-oil/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:text-[#429828] hover:bg-[#f4fbf2] transition-all group">
                <ShoppingBag
                  size={22}
                  strokeWidth={1.5}
                  className="group-hover:scale-110 transition-transform"
                />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#429828] border-2 border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 3. Bottom Category Navigation ───────────────── */}
        <div
          className={`hidden lg:block border-t border-gray-100 transition-all duration-300 ${isScrolled ? "h-0 overflow-hidden opacity-0 border-transparent" : "opacity-100"}`}>
          <div className="max-w-[1440px] mx-auto px-8">
            <ul className="flex items-center justify-center gap-10 py-4">
              <li>
                <Link
                  to="/hair-care"
                  className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#429828] transition-colors uppercase tracking-widest group">
                  <Droplets
                    size={16}
                    strokeWidth={2}
                    className="text-[#8CC63F] group-hover:scale-110 transition-transform"
                  />{" "}
                  HAIR CARE
                </Link>
              </li>
              <li>
                <Link
                  to="/skin-care"
                  className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#429828] transition-colors uppercase tracking-widest group">
                  <Sprout
                    size={16}
                    strokeWidth={2}
                    className="text-[#8CC63F] group-hover:scale-110 transition-transform"
                  />{" "}
                  SKIN CARE
                </Link>
              </li>

              <li className="group relative">
                <button className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#429828] transition-colors uppercase tracking-widest focus:outline-none py-2">
                  SHOP BY CATEGORY{" "}
                  <ChevronDown
                    size={14}
                    strokeWidth={2.5}
                    className="mt-0.5 group-hover:rotate-180 transition-transform duration-300"
                  />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white border border-gray-100 shadow-xl rounded-xl py-3 w-56 flex flex-col">
                    {[
                      "Organic Oils",
                      "Herbal Shampoos",
                      "Face Serums",
                      "Body Scrubs",
                    ].map((item) => (
                      <Link
                        key={item}
                        to={`/category/${item.toLowerCase().replace(" ", "-")}`}
                        className="px-5 py-2.5 text-sm text-gray-600 hover:bg-[#f4fbf2] hover:text-[#429828] font-medium transition-colors">
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              <li>
                <Link
                  to="/collective"
                  className="flex items-center gap-2 group bg-[#fefcf8] border border-[#f4ebce] px-4 py-1.5 rounded-full hover:bg-[#f4ebce]/30 transition-colors">
                  <span className="text-xs font-black uppercase tracking-widest text-[#C59B43]">
                    JOIN
                  </span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#112315] group-hover:bg-[#429828] transition-colors shadow-sm">
                    COLLECTIVE
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/combos"
                  className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-[#429828] transition-colors uppercase tracking-widest group">
                  <Gift
                    size={16}
                    strokeWidth={2}
                    className="text-[#8CC63F] group-hover:scale-110 transition-transform"
                  />{" "}
                  VALUE COMBOS
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* ─── 4. Mobile Menu Overlay & Drawer ───────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[340px] bg-white z-[110] shadow-2xl transform transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] lg:hidden flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#fefcf8]">
          <div>
            <h2
              className="text-xl font-bold tracking-tight text-[#112315]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              TARUVEDA
            </h2>
            <span className="text-[9px] tracking-[0.2em] text-[#429828] font-bold uppercase block">
              Organic Farms
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none transition-colors">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5 border-b border-gray-100">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-[#429828] focus:ring-1 focus:ring-[#429828] transition-all"
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#429828] transition-colors">
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <ul className="flex flex-col">
            <li>
              <Link
                to="/hair-care"
                className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-800 border-b border-gray-50 hover:bg-[#f4fbf2] transition-colors">
                <Droplets size={20} className="text-[#8CC63F]" /> Hair Care
              </Link>
            </li>
            <li>
              <Link
                to="/skin-care"
                className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-gray-800 border-b border-gray-50 hover:bg-[#f4fbf2] transition-colors">
                <Sprout size={20} className="text-[#8CC63F]" /> Skin Care
              </Link>
            </li>
            <li>
              <button className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-gray-800 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                Shop By Category{" "}
                <ChevronDown size={18} className="text-gray-400" />
              </button>
            </li>
            <li>
              <Link
                to="/collective"
                className="flex items-center gap-3 px-6 py-5 text-sm font-bold bg-[#fefcf8] border-b border-gray-100">
                <span className="text-[#C59B43] tracking-widest">JOIN</span>
                <span className="text-[10px] font-bold text-white px-2.5 py-1 rounded-full bg-[#112315] tracking-widest shadow-sm">
                  COLLECTIVE
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Footer Area linked with Auth */}
        <div className="p-6 bg-gray-50 mt-auto border-t border-gray-100">
          {user ? (
            <Link
              to="/profile"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#429828] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2C3E30] transition-all shadow-sm">
              Hi, {user.name?.split(" ")[0] || "User"}
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-[#429828] hover:text-[#429828] transition-all shadow-sm">
              <User size={18} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
