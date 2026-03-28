import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import UserNavbar from "../features/account/components/bars/UserNavbar";
import BottomNavbar from "../features/account/components/bars/BottomHomeNavbar";
import Footer from "../components/footer/Footer";
import UnverifiedEmailPopup from "../features/auth/pages/UnverifiedEmailPopup";

const UserLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // 1. FIXED: Changed 'smooth' to 'instant'.
  // Smooth scrolling on route changes feels laggy in SPAs. Instant snapping is the standard.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white font-sans selection:bg-[#ff3f6c] selection:text-white">
      {/* TOP NAVIGATION (Fixed & High Z-Index) */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <UserNavbar />
      </div>

      <main
        className={`
          flex-1 w-full flex flex-col
          pb-20 md:pb-0 /* Padding for bottom mobile navbar */
          ${isHome ? "pt-[80px] md:pt-[100px]" : "pt-[60px] md:pt-[110px]"}
        `}>
        {/* 2. FIXED: Added 'key={location.pathname}' */}
        {/* Without the key, React won't re-render this div, meaning the fade-in animation would only play once. */}
        <div
          key={location.pathname}
          className="flex-1 w-full animate-in fade-in duration-500 fill-mode-both">
          <Outlet />
        </div>
      </main>
      <UnverifiedEmailPopup />

      {/* FOOTER */}
      <Footer />

      <div className="z-100">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default UserLayout;
