import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PromotionalNavbar from "./PromotionalNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";
import { IMAGES } from "../../../../../assets/images";
import { promoData } from "../../data/promoData";
import LoginPopup from "../../../../components/pop-up/LoginPoup";
import { useAuth } from "../../../auth/context/UserContext";

const DesktopNavbar = ({
  app_name = "Mnmukt",
  cartCount,
  wishlistCount,
  categoryMenuItems = [],
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // console.log(wishlistCount);
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
        className={`bg-linear-to-r from-[#da127d] to-[#e91e8b] text-white transition-all duration-500 ease-in-out overflow-hidden ${
          showPromo ? "max-h-[50px] opacity-100" : "max-h-0 opacity-0"
        }`}>
        <PromotionalNavbar items={promoData} interval={4000} />
      </div>

      {/* --- Main Navbar: Glassmorphism on scroll --- */}
      <header
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20"
            : "bg-white border-b border-gray-100"
        }`}>
        <div className="w-full max-w-[1600px] mx-auto px-5 lg:px-10 flex items-center justify-between h-[80px]">
          {/* LEFT: Premium Hamburger Menu */}
          <div className="flex-1 flex justify-start items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 -ml-2 group"
              aria-label="Toggle Menu">
              <div className="flex flex-col justify-between w-[26px] h-[15px]">
                <span
                  className={`h-[1.5px] rounded-full bg-gray-900 transition-all duration-300 ease-out group-hover:bg-[#da127d] ${
                    menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
                  }`}
                />
                <span
                  className={`h-[1.5px] rounded-full bg-gray-900 transition-all duration-300 ease-out group-hover:bg-[#da127d] ${
                    menuOpen ? "opacity-0 translate-x-3" : ""
                  }`}
                />
                <span
                  className={`h-[1.5px] rounded-full bg-gray-900 transition-all duration-300 ease-out group-hover:bg-[#da127d] ${
                    menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
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
              className="h-9 md:h-11 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* RIGHT: Elegant Icons */}
          <div className="flex-1 flex justify-end items-center gap-5 sm:gap-7 text-gray-800">
            {/* 1. Profile */}
            <button
              onClick={() => handleProtectedRoute("/user/profile")}
              className="group relative p-1 transition-transform duration-300 hover:-translate-y-1">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="group-hover:text-[#da127d] transition-colors duration-300">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </button>

            {/* 2. Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className="relative group p-1 transition-transform duration-300 hover:-translate-y-1">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:text-[#da127d] transition-colors duration-300 group-hover:fill-[#da127d]/10">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>

              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#da127d] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:scale-110">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 3. Search */}
            <button
              onClick={() => navigate("/search")}
              className="group p-1 transition-transform duration-300 hover:-translate-y-1">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:text-[#da127d] transition-colors duration-300">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* 4. Cart / Bag */}
            <button
              onClick={() => handleProtectedRoute("/checkout/cart")}
              className="group relative p-1 transition-transform duration-300 hover:-translate-y-1">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:text-[#da127d] transition-colors duration-300">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#da127d] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:scale-110">
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
