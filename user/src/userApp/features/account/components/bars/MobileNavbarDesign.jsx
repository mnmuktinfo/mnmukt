import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Heart, ShoppingBag, PlusSquare } from "lucide-react"; // Imported PlusSquare for the install icon
import usePWADownload from "../../../../hook/usePWADownload";
import PromotionalNavbar from "./PromotionalNavbar";
import NavbarDropdown from "../dropdown/NavbarDropdwown";
import AppInstallOverlay from "../../../../downloadApp/AppInstallOverlay"; // Make sure the path is correct

import { categoryMenuItems } from "../../data/categoryMenuItems";
import { accountMenuData } from "../../data/accountMenuData";
import { IMAGES } from "../../../../../assets/images";

// --- Premium Notification Badge ---
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
  const { triggerInstall, deferredPrompt } = usePWADownload();
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAccountPage = location.pathname.startsWith("/user");
  const activeMenuItems = isAccountPage ? accountMenuData : categoryMenuItems;

  // Passive scroll listener for Frosted Glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer automatically when navigating to a new page
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const installed = await triggerInstall();
      if (!installed) {
        // fallback: show your overlay with instructions
        setShowInstallPopup(true);
      }
    } else {
      // browser does not support prompt; show your overlay
      setShowInstallPopup(true);
    }
  };

  return (
    <>
      <header
        className={`md:hidden fixed top-0 left-0 w-full z-[100] font-sans transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-b border-gray-100/50"
            : "bg-white border-b border-gray-100"
        }`}>
        {/* 1. Premium Promo Bar (Smoothly hides on scroll) */}
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

        {/* 2. Main Navbar Row */}
        <div className="flex items-center justify-between h-[60px] px-4 w-full">
          {/* ── LEFT SECTION: Hamburger & Logo ── */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-1 -ml-1 flex flex-col justify-center items-center gap-[4.5px] active:scale-95 transition-transform"
              aria-label="Open menu">
              {/* Custom thin lines matching desktop layout */}
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

          {/* ── RIGHT SECTION: Actions (Install, Wishlist, Cart) ── */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* App Install Button */}
            <button
              onClick={handleInstallClick}
              className="p-1 text-gray-700 hover:text-[#da127d] active:scale-95 transition-all"
              aria-label="Install App">
              <PlusSquare size={22} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                `relative p-1 active:scale-95 transition-all ${
                  isActive
                    ? "text-[#da127d]"
                    : "text-gray-700 hover:text-[#da127d]"
                }`
              }
              aria-label="Wishlist">
              <Heart size={22} strokeWidth={1.5} />
              <BadgeCount count={wishlistCount} />
            </NavLink>

            {/* Cart */}
            <NavLink
              to="/checkout/cart"
              className={({ isActive }) =>
                `relative p-1 active:scale-95 transition-all ${
                  isActive
                    ? "text-[#da127d]"
                    : "text-gray-700 hover:text-[#da127d]"
                }`
              }
              aria-label="Cart">
              <ShoppingBag size={22} strokeWidth={1.5} />
              <BadgeCount count={cartCount} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* ── App Install Overlay ── */}
      <AppInstallOverlay
        isOpen={showInstallPopup}
        onClose={() => setShowInstallPopup(false)}
        appName="Mnmukt" // Update this to your actual brand name
      />

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
