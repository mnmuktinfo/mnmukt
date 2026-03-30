import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

import PromotionalNavbar from "./PromotionalNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";

import { categoryMenuItems } from "../../data/categoryMenuItems";
import { accountMenuData } from "../../data/accountMenuData";
import { IMAGES } from "../../../../../assets/images";

const BadgeCount = ({ count }) => {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1.5 bg-[#da127d] text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center tracking-tighter border-2 border-white shadow-sm z-10">
      {count > 99 ? "99+" : count}
    </span>
  );
};

const MobileNavbar = ({ cartCount = 0, wishlistCount = 0, promoData }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAccountPage = location.pathname.startsWith("/user");
  const activeMenuItems = isAccountPage ? accountMenuData : categoryMenuItems;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`md:hidden fixed top-0 left-0 w-full z-[100] font-sans transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-b border-gray-100/50"
            : "bg-white border-b border-gray-100"
        }`}>
        {promoData && promoData.length > 0 && (
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden bg-gradient-to-r from-[#da127d] to-[#e91e8b] text-white ${
              scrolled ? "max-h-0 opacity-0" : "max-h-[40px] opacity-100"
            }`}>
            <PromotionalNavbar
              items={promoData}
              interval={4000}
              scrolled={false}
            />
          </div>
        )}

        <div className="flex items-center justify-between h-[60px] px-4 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-1 -ml-1 flex flex-col justify-center items-center gap-[4.5px] active:scale-95 transition-transform focus:outline-none"
              aria-label="Open menu">
              <span className="h-[1.5px] w-5 bg-gray-800 rounded-full" />
              <span className="h-[1.5px] w-5 bg-gray-800 rounded-full" />
              <span className="h-[1.5px] w-5 bg-gray-800 rounded-full" />
            </button>

            <div
              onClick={() => navigate("/")}
              className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
              <img
                src={IMAGES.brand.logo}
                className="h-8 w-auto object-contain"
                alt="Brand Logo"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                `relative p-1 active:scale-95 transition-all focus:outline-none ${
                  isActive
                    ? "text-[#da127d]"
                    : "text-gray-700 hover:text-[#da127d]"
                }`
              }
              aria-label="Wishlist">
              <HeartIcon className="w-6 h-6" strokeWidth={1.5} />
              <BadgeCount count={wishlistCount} />
            </NavLink>

            <NavLink
              to="/checkout/cart"
              className={({ isActive }) =>
                `relative p-1 active:scale-95 transition-all focus:outline-none ${
                  isActive
                    ? "text-[#da127d]"
                    : "text-gray-700 hover:text-[#da127d]"
                }`
              }
              aria-label="Cart">
              <ShoppingBagIcon className="w-6 h-6" strokeWidth={1.5} />
              <BadgeCount count={cartCount} />
            </NavLink>
          </div>
        </div>
      </header>

      <NavbarDropdown
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={activeMenuItems}
      />
    </>
  );
};

export default MobileNavbar;
