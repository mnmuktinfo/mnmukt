import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import UserNavbar from "../features/account/components/bars/UserNavbar";
import WhatsAppPopup from "../components/pop-up/WhatsAppPopup";
import BottomNavbar from "../features/account/components/bars/BottomHomeNavbar";
import Footer from "../components/footer/Footer";

const UserLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Optional: Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F8F9FA] font-sans selection:bg-red-100 selection:text-red-700">
      {/* 1. TOP NAVIGATION (Fixed & High Z-Index) */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <UserNavbar />
      </div>

      {/* 2. PAGE CONTENT 
         - flex-1: Fills vertical space
         - Padding Top: Calculates space for fixed navbar + extra "give" user requested
      */}
      <main
        className={`
          flex-1 w-full 
          transition-all duration-300 ease-in-out
          ${
            isHome
              ? // HOME PAGE: Just enough padding so Navbar doesn't cover Hero
                "pt-[64px] "
              : // OTHER PAGES: More breathing room + Centered container
                "   "
          }
        `}>
        <div className="animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      {/* 3. FLOATING ELEMENTS */}
      <WhatsAppPopup />
      <BottomNavbar />
      <Footer />
    </div>
  );
};

export default UserLayout;
