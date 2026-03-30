import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import UserNavbar from "../features/account/components/bars/UserNavbar";
import BottomNavbar from "../features/account/components/bars/BottomHomeNavbar";
import Footer from "../components/footer/Footer";
import UnverifiedEmailPopup from "../features/auth/pages/UnverifiedEmailPopup";
import WhatsAppButton from "../../shared/components/WhatsAppButton";

const UserLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Scroll to top instantly on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-white font-sans selection:bg-[#ff3f6c] selection:text-white">
      {/* ── TOP NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-[101] bg-white w-full shadow-sm">
        <UserNavbar />
      </header>
      {/* ── MAIN CONTENT ── */}
      <main
        className={`
          flex-1 w-full flex flex-col
          pb-[env(safe-area-inset-bottom)] md:pb-0
          ${isHome ? "pt-[80px] md:pt-[100px]" : "pt-[60px] md:pt-[110px]"}
        `}>
        <div
          key={location.pathname}
          className="flex-1 w-full animate-in fade-in duration-500 fill-mode-both">
          <Outlet />
        </div>
      </main>
      {/* ── UNVERIFIED EMAIL POPUP ── */}
      <div className="z-[102]">
        <UnverifiedEmailPopup />
      </div>
      <WhatsAppButton /> {/* ── FOOTER ── */}
      <div className="relative z-[100]">
        <Footer className="md:pb-0 pb-[70px]" />
      </div>
      {/* ── BOTTOM MOBILE NAVBAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-100 md:hidden  bg-white">
        <BottomNavbar />
      </div>
    </div>
  );
};

export default UserLayout;
