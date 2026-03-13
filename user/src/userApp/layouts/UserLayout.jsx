import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import UserNavbar from "../features/account/components/bars/UserNavbar";
import WhatsAppPopup from "../components/pop-up/WhatsAppPopup";
import BottomNavbar from "../features/account/components/bars/BottomHomeNavbar";
import Footer from "../components/footer/Footer";

const UserLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Scroll to top automatically when navigating between pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white font-sans selection:bg-[#007673] selection:text-white">
      {/* 1. TOP NAVIGATION (Fixed & High Z-Index) */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <UserNavbar />
      </div>

      {/* 2. PAGE CONTENT 
          - flex-1: Fills all available vertical space
          - isHome: 0 padding so the Hero Banner slides perfectly under the transparent navbar.
          - !isHome: Adds top padding so inner pages aren't hidden behind the solid white navbar.
          - pb-16 md:pb-0: Adds padding at the bottom ONLY on mobile so the BottomNavbar doesn't hide content.
      */}
      <main
        className={`
          flex-1 w-full flex flex-col
          transition-all duration-300 ease-in-out
          pb-16 md:pb-0
          ${isHome ? "pt-33" : "pt-[60px] md:pt-[110px]"}
        `}>
        {/* Subtle fade-in effect on route changes */}
        <div className="flex-1 w-full animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>

      {/* 3. FOOTER */}
      <Footer />

      {/* 4. FLOATING ELEMENTS */}
      <WhatsAppPopup />
      <BottomNavbar />
    </div>
  );
};

export default UserLayout;
