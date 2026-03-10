import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import PromotionalNavbar from "./PromotinlNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";
import NavbarRightIcons from "./NavbarRightIcons";
import { IMAGES } from "../../../../../assets/images";

import { rightSideDesktopNavbarIcons } from "../../data/navbarIcons";
import { promoData } from "../../data/promoData";

const DesktopNavbar = ({
  app_name = "Mnmukt",
  cartCount,
  categoryMenuItems = [],
}) => {
  const [scrolledValue, setScrolledValue] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Logic: Always "scrolled" (white bg) on inner pages, transparent only on Home top
  const isHomePage = location.pathname === "/";
  const scrolled = isHomePage ? scrolledValue : true;

  const menuItems = rightSideDesktopNavbarIcons(navigate, cartCount);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setScrolledValue(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out font-sans
        ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm text-gray-900 border-b border-gray-100"
            : "bg-transparent text-white bg-gradient-to-b from-black/50 to-transparent"
        }
      `}>
      {/* 1. Top Promo Bar (Optional - remove if only wanted on Home) */}
      <div
        className={`transition-opacity duration-300 ${scrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}>
        <PromotionalNavbar
          items={promoData}
          interval={3000}
          scrolled={scrolled}
        />
      </div>

      <div className="w-full max-w-[1500px] mx-auto px-6 lg:px-10">
        {/* 2. Main Navbar Row (Logo & Icons) */}
        <div className="h-20 flex items-center justify-between">
          {/* LEFT: Logo & Location */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95">
              <img
                src={!scrolled ? IMAGES.brand.logoWhite : IMAGES.brand.logo}
                alt={`${app_name} logo`}
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Country / Currency Selector (Clean Pill Design) */}
            <div
              className={`
                hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border
                ${
                  scrolled
                    ? "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }
              `}>
              <span className="text-gray-400">Ship to</span>
              <img
                src="https://flagcdn.com/w20/in.png"
                className="w-4 h-3 rounded-[2px] shadow-sm"
                alt="India"
              />
              <span>IN (₹)</span>
            </div>
          </div>

          {/* RIGHT: Search & Icons */}
          {/* Note: Pass 'scrolled' prop to Icons component to adjust their colors if needed */}
          <NavbarRightIcons
            scrolled={scrolled}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            menuItems={menuItems}
            categoryMenuItems={categoryMenuItems}
            DropdownComponent={NavbarDropdown}
          />
        </div>

        {/* 3. Bottom Row: Category Menu */}
        <nav
          className={`
            hidden md:flex items-center justify-center h-12 gap-8 text-[13px] font-semibold tracking-wide uppercase border-t transition-colors
            ${scrolled ? "border-gray-100" : "border-white/10"}
          `}>
          {categoryMenuItems.slice(0, 10).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative group py-3 transition-colors duration-300
                ${
                  isActive
                    ? "text-red-600"
                    : scrolled
                      ? "text-gray-600 hover:text-red-600"
                      : "text-gray-200 hover:text-white"
                }
              `}>
              {item.label}

              {/* Animated Underline */}
              <span
                className={`
                absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left
              `}
              />
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default DesktopNavbar;
