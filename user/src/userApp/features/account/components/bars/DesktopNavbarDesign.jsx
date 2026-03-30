import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

import PromotionalNavbar from "./PromotionalNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";
import { IMAGES } from "../../../../../assets/images";
import LoginPopup from "../../../../components/pop-up/LoginPoup";
import { useAuth } from "../../../auth/context/UserContext";

const DesktopNavbar = ({
  app_name = "Mnmukt",
  cartCount = 0,
  wishlistCount = 0,
  categoryMenuItems = [],
  promoData,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const [loginOpen, setLoginOpen] = useState(false);

  // Refined scroll logic for smooth hiding/showing and shadow effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Toggle glassmorphism shadow when scrolling past the top
      setIsScrolled(currentScrollY > 20);

      // Hide promo bar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShowPromo(false);
      } else {
        setShowPromo(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProtectedRoute = (path) => {
    if (user) {
      navigate(path);
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <>
      {/* --- Premium Promo Bar --- */}
      <div
        className={`bg-gradient-to-r from-[#da127d] to-[#e91e8b] text-white transition-all duration-500 ease-in-out overflow-hidden ${
          showPromo ? "max-h-[50px] opacity-100" : "max-h-0 opacity-0"
        }`}>
        <PromotionalNavbar items={promoData} interval={4000} />
      </div>

      {/* --- Main Navbar: Glassmorphism on scroll --- */}
      <header
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-b border-gray-100/50"
            : "bg-white border-b border-gray-200"
        }`}>
        <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 flex items-center justify-between h-[80px]">
          {/* LEFT: Premium Animated Hamburger Menu */}
          <div className="flex-1 flex justify-start items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -ml-2 group focus:outline-none"
              aria-label="Toggle Menu">
              <div className="flex flex-col justify-between w-[24px] h-[14px]">
                <span
                  className={`h-[1.5px] rounded-full bg-black transition-all duration-300 ease-out group-hover:bg-[#da127d] ${
                    menuOpen ? "rotate-45 translate-y-[6px]" : ""
                  }`}
                />
                <span
                  className={`h-[1.5px] rounded-full bg-black transition-all duration-300 ease-out group-hover:bg-[#da127d] ${
                    menuOpen ? "opacity-0 translate-x-3" : ""
                  }`}
                />
                <span
                  className={`h-[1.5px] rounded-full bg-black transition-all duration-300 ease-out group-hover:bg-[#da127d] ${
                    menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>

          {/* CENTER: Logo with scale effect */}
          <div
            className="flex-1 flex justify-center items-center cursor-pointer group"
            onClick={() => {
              setMenuOpen(false);
              navigate("/");
            }}>
            <img
              src={IMAGES.brand.logo}
              alt={`${app_name} logo`}
              className="h-8 md:h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* RIGHT: Elegant Icons (Heroicons) */}
          <div className="flex-1 flex justify-end items-center gap-6 sm:gap-8 text-black">
            {/* 1. Profile */}
            <button
              onClick={() => handleProtectedRoute("/user/profile")}
              className="group relative p-1 transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none"
              aria-label="Profile">
              <UserIcon className="w-6 h-6 stroke-[1.5] group-hover:text-[#da127d] transition-colors duration-300" />
            </button>

            {/* 2. Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className="relative group p-1 transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none"
              aria-label="Wishlist">
              <HeartIcon className="w-6 h-6 stroke-[1.5] group-hover:text-[#da127d] transition-colors duration-300" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#da127d] text-white text-[9px] font-bold h-[16px] min-w-[16px] px-1 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:scale-110">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 3. Search */}
            <button
              onClick={() => navigate("/search")}
              className="group p-1 transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none"
              aria-label="Search">
              <MagnifyingGlassIcon className="w-6 h-6 stroke-[1.5] group-hover:text-[#da127d] transition-colors duration-300" />
            </button>

            {/* 4. Cart / Bag */}
            <button
              onClick={() => handleProtectedRoute("/checkout/cart")}
              className="relative group p-1 transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none"
              aria-label="Cart">
              <ShoppingBagIcon className="w-6 h-6 stroke-[1.5] group-hover:text-[#da127d] transition-colors duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#da127d] text-white text-[9px] font-bold h-[16px] min-w-[16px] px-1 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:scale-110">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <LoginPopup isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      <NavbarDropdown
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={categoryMenuItems}
      />
    </>
  );
};

export default DesktopNavbar;
