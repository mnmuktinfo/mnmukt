import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import PromotionalNavbar from "./PromotionalNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";
import LoginPopup from "../../../../components/pop-up/LoginPoup";

import { categoryMenuItems } from "../../data/categoryMenuItems";
import { accountMenuData } from "../../data/accountMenuData";
import { IMAGES } from "../../../../../assets/images";

import { GoldUserIcon } from "./Icons";
import { useAuth } from "../../../auth/context/UserContext";

const ICON_SIZE = 18;

const MobileNavbar = ({ cartCount = 0, promoData, onCartClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isAccountPage = location.pathname.startsWith("/user");

  const activeMenuItems = isAccountPage ? accountMenuData : categoryMenuItems;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleProtectedRoute = (path) => {
    if (user) navigate(path);
    else setLoginOpen(true);
  };

  const iconBase =
    "transition-all duration-300 hover:text-[#d4af37] text-gray-800";

  const iconWrapper = "relative p-1 flex items-center justify-center";

  const badge =
    "absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-[4px] rounded-full bg-black text-white text-[9px] font-semibold flex items-center justify-center";

  return (
    <>
      {/* HEADER */}

      <header
        className={`md:hidden fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg border-b border-gray-100"
            : "bg-white border-b border-gray-100"
        }`}>
        {/* PROMO */}

        {promoData?.length > 0 && (
          <div
            className={`overflow-hidden bg-gradient-to-r from-[#da127d] to-[#e91e8b] text-white transition-all duration-500 ${
              scrolled ? "max-h-0 opacity-0" : "max-h-[38px] opacity-100"
            }`}>
            <PromotionalNavbar items={promoData} interval={4000} />
          </div>
        )}

        {/* NAVBAR */}

        <div className="flex items-center justify-between h-[62px] px-4">
          {/* MENU */}

          <button
            onClick={() => setMenuOpen(true)}
            className="w-8 h-8 flex flex-col justify-center gap-[5px]">
            <span className="h-[1px] w-6 bg-black" />
            <span className="h-[1px] w-6 bg-black" />
            <span className="h-[1px] w-6 bg-black" />
          </button>

          {/* LOGO */}

          <div
            onClick={() => navigate("/")}
            className="cursor-pointer active:scale-95 transition">
            <img
              src={IMAGES.brand.logo}
              alt="logo"
              className="h-7 object-contain"
            />
          </div>

          {/* RIGHT ICONS */}

          <div className="flex items-center gap-5">
            {/* USER */}

            <button
              onClick={() => handleProtectedRoute("/user/profile")}
              className={`${iconWrapper} ${iconBase}`}>
              <GoldUserIcon className="w-[18px] h-[18px]" />
            </button>

            {/* SEARCH */}

            <button
              onClick={() => navigate("/search")}
              className={`${iconWrapper} ${iconBase}`}>
              <svg
                width={ICON_SIZE}
                height={ICON_SIZE}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>

            {/* CART */}

            <button
              onClick={onCartClick}
              className={`${iconWrapper} ${iconBase}`}>
              <svg
                width={ICON_SIZE}
                height={ICON_SIZE}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5">
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6l-2-3H2" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>

              {cartCount > 0 && (
                <span className={badge}>
                  {cartCount > 9 ? "9+" : cartCount}
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
        menuItems={activeMenuItems}
      />
    </>
  );
};

export default MobileNavbar;
