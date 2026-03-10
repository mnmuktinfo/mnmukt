import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, Heart, ShoppingBag } from "lucide-react";

import PromotionalNavbar from "./PromotinlNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";

import { categoryMenuItems } from "../../data/categoryMenuItems";
import { accountMenuData } from "../../data/accountMenuData";
import { IMAGES } from "../../../../../assets/images";

const MobileNavbar = ({ cartCount = 0, promoData }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledValue, setScrolledValue] = useState(false);

  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Context-based Menu Logic
  const isAccountPage = location.pathname.startsWith("/account");
  const activeMenuItems = isAccountPage ? accountMenuData : categoryMenuItems;

  // 2. Transparency Logic
  const isHomePage = location.pathname === "/";
  const isScrolled = isHomePage ? scrolledValue : true;

  useEffect(() => {
    const handleScroll = () => setScrolledValue(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`
          md:hidden fixed top-0 left-0 w-full z-40 transition-all duration-500 font-sans
          ${
            isScrolled
              ? "bg-white backdrop-blur-xl border-b border-slate-50 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)]"
              : "bg-transparent"
          }
        `}>
        {/* Top Promo Bar (Only visible at absolute top of home) */}
        {isHomePage && !scrolledValue && (
          <div className="border-b border-white/10">
            <PromotionalNavbar
              items={promoData}
              interval={4000}
              scrolled={isScrolled}
            />
          </div>
        )}

        {/* --- MAIN NAVBAR --- */}
        <div
          ref={navRef}
          className={`flex items-center justify-between h-16 px-6 relative transition-all duration-500 ${
            isScrolled ? "text-slate-900" : "text-white"
          }`}>
          {/* LEFT: Menu Trigger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1 -ml-1 active:scale-90 transition-transform"
            aria-label="Menu">
            <Menu size={22} strokeWidth={1.2} />
          </button>

          {/* CENTER: Logo (Balanced Height) */}
          <NavLink
            to="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all">
            <img
              src={!isScrolled ? IMAGES.brand.logoWhite : IMAGES.brand.logo}
              className={`transition-all duration-500 ${isScrolled ? "h-6" : "h-7"}`}
              alt="Mnmukt"
            />
          </NavLink>

          {/* RIGHT: Action Icons (HUD Style) */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/search")}
              className="active:scale-90 transition-transform"
              aria-label="Search">
              <Search size={20} strokeWidth={1.5} />
            </button>

            <NavLink
              to="/wishlist"
              className="active:scale-90 transition-transform"
              aria-label="Wishlist">
              <Heart size={20} strokeWidth={1.5} />
            </NavLink>

            <NavLink
              to="/checkout/cart"
              className="relative active:scale-90 transition-transform"
              aria-label="Cart">
              <ShoppingBag size={20} strokeWidth={1.5} />

              {/* Mnmukt Signature Pink Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff356c] text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center tracking-tighter shadow-sm border border-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </header>

      {/* Side Drawer */}
      <NavbarDropdown
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={activeMenuItems}
      />
    </>
  );
};

export default MobileNavbar;
