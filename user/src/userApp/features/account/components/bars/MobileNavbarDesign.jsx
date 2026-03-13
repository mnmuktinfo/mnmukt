import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, Heart, ShoppingBag } from "lucide-react";

import PromotionalNavbar from "./PromotinlNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";

import { categoryMenuItems } from "../../data/categoryMenuItems";
import { accountMenuData } from "../../data/accountMenuData";
import { IMAGES } from "../../../../../assets/images";

// Premium Badge for Wishlist & Cart
const BadgeCount = ({ count }) => {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 bg-[#007673] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center tracking-tighter border-2 border-white shadow-sm z-10">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const MobileNavbar = ({ cartCount = 0, wishlistCount = 0, promoData }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isAccountPage = location.pathname.startsWith("/user");
  const activeMenuItems = isAccountPage ? accountMenuData : categoryMenuItems;

  // Passive scroll listener (used ONLY for shadow and hiding promo bar, background stays white)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer automatically when navigating to a new page
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`
          md:hidden fixed top-0 left-0 w-full z-[100] font-sans transition-all duration-300 bg-white
          ${scrolled ? "shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-b border-gray-200" : "border-b border-gray-100"}
        `}>
        {/* 1. Promo Bar (Smoothly hides when scrolled down) */}
        {promoData && promoData.length > 0 && (
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden bg-gray-50 border-b border-gray-100 ${
              scrolled ? "h-0 opacity-0" : "h-auto opacity-100"
            }`}>
            <PromotionalNavbar
              items={promoData}
              interval={4000}
              scrolled={false} // Force standard text color
            />
          </div>
        )}

        {/* 2. Main Navbar Row */}
        <div className="flex items-center justify-between h-[64px] px-4 relative text-gray-900">
          {/* Left: Hamburger Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1 -ml-1 flex items-center justify-center text-gray-700 hover:text-gray-900 active:scale-95 transition-all"
            aria-label="Open menu">
            <Menu size={26} strokeWidth={1.5} />
          </button>

          {/* Center: Logo (Always colored/dark since bg is always white) */}
          <div
            onClick={() => navigate("/")}
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
            <img
              src={IMAGES.brand.logo} // Always use the standard logo
              className="h-15 w-auto object-contain"
              alt="Mnmukt Logo"
            />
          </div>

          {/* Right: Icons (Wishlist & Cart) */}
          <div className="flex items-center gap-4">
            {/* Wishlist */}
            <NavLink
              to="/wishlist"
              className="relative p-1 text-gray-700 hover:text-[#007673] active:scale-95 transition-all"
              aria-label="Wishlist">
              <Heart size={24} strokeWidth={1.5} />
              <BadgeCount count={wishlistCount} />
            </NavLink>

            {/* Cart */}
            <NavLink
              to="/checkout/cart"
              className="relative p-1 text-gray-700 hover:text-[#007673] active:scale-95 transition-all"
              aria-label="Cart">
              <ShoppingBag size={24} strokeWidth={1.5} />
              <BadgeCount count={cartCount} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Side Drawer Overlay (Triggered by Hamburger) */}
      <NavbarDropdown
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={activeMenuItems}
      />
    </>
  );
};

export default MobileNavbar;
