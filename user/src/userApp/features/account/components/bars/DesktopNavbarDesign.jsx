import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import PromotionalNavbar from "./PromotinlNavbar";
import NavbarRightIcons from "./NavbarRightIcons";
import NavbarDropdown from "../dropdown/NavbarDropdwown";
import { IMAGES } from "../../../../../assets/images";

import { rightSideDesktopNavbarIcons } from "../../data/navbarIcons";
import { promoData } from "../../data/promoData";

const DesktopNavbar = ({
  app_name = "Mnmukt",
  cartCount,
  categoryMenuItems = [],
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuItems = rightSideDesktopNavbarIcons(navigate, cartCount);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-100 font-sans bg-white shadow-2xl border-b border-gray-200">
        {/* Promo Bar (Clean, light gray background to match the white navbar) */}
        <div className="h-auto bg-gray-50 border-b border-gray-100">
          <PromotionalNavbar items={promoData} interval={4000} />
        </div>

        {/* Main Row: Left Menu + Center Logo + Right Icons */}
        <div className="w-full max-w-[1500px] mx-auto px-5 lg:px-8 flex items-center justify-between h-[72px]">
          {/* LEFT: Menu Toggle Button */}
          <div className="flex-1 flex justify-start items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 group active:scale-95 transition-transform"
              aria-label="Toggle Menu">
              {/* Premium Animated Hamburger Icon */}
              <div className="flex flex-col gap-[5px] w-6 justify-center items-start">
                <span
                  className={`h-[2px] bg-gray-900 rounded-full transition-all duration-300 ${menuOpen ? "w-6 rotate-45 translate-y-[7px]" : "w-6 group-hover:w-5"}`}
                />
                <span
                  className={`h-[2px] bg-gray-900 rounded-full transition-all duration-300 ${menuOpen ? "w-0 opacity-0" : "w-4 group-hover:w-6"}`}
                />
                <span
                  className={`h-[2px] bg-gray-900 rounded-full transition-all duration-300 ${menuOpen ? "w-6 -rotate-45 -translate-y-[7px]" : "w-6 group-hover:w-4"}`}
                />
              </div>

              {/* Text Label (Hidden on tiny screens, visible on desktop) */}
              <span className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-gray-900 group-hover:text-[#007673] transition-colors mt-0.5">
                {menuOpen ? "Close" : "Menu"}
              </span>
            </button>
          </div>

          {/* CENTER: Logo */}
          <div
            className="flex-1 flex justify-center items-center cursor-pointer transition-opacity hover:opacity-80 active:scale-95"
            onClick={() => {
              setMenuOpen(false);
              navigate("/");
            }}>
            <img
              src={IMAGES.brand.logo}
              alt={`${app_name} logo`}
              className="h-8 md:h-10 w-auto object-contain"
            />
          </div>

          {/* RIGHT: User & Other Icons */}
          <div className="flex-1 flex justify-end items-center">
            <NavbarRightIcons menuItems={menuItems} />
          </div>
        </div>
      </header>

      {/* Left Side Dropdown / Drawer Component */}
      <NavbarDropdown
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        menuItems={categoryMenuItems}
      />
    </>
  );
};

export default DesktopNavbar;
