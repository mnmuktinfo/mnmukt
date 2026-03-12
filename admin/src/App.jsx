import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

/* ---------------- LAZY ROUTES ---------------- */
// Lazy loading splits your code into smaller chunks, speeding up initial load
const AdminInquiryRoutes = lazy(() => import("./routes/AdminInquiryRoutes"));
const AdminLayoutRoutes = lazy(() => import("./routes/AdminLayoutRoutes"));
const TaruvedaRoutes = lazy(() => import("./routes/TaruvedaRoutes"));
const AdminSignupPage = lazy(() => import("./pages/AdminSignUpPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));

/* ---------------- ULTRA-FAST SYSTEM LOADER ---------------- */
// Removed external icon libraries here. Using pure CSS/Tailwind for instant rendering.
const InitializingSystem = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f3f6] antialiased fixed inset-0 z-[9999]">
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 ease-out">
      {/* Brand Logo Box (Flipkart Style) */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#2874f0] rounded-sm flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.15)] relative overflow-hidden">
          <span className="text-white font-bold text-2xl italic tracking-tighter pr-1">
            M
          </span>
          {/* Signature Yellow Accent */}
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#ffe500] rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold italic tracking-tight text-[#212121] leading-none">
            Mnmukt
          </span>
          <span className="text-[10px] font-bold text-[#878787] uppercase tracking-widest mt-1">
            Seller Hub
          </span>
        </div>
      </div>

      {/* Pure CSS Loading Indicator (Zero Dependencies) */}
      <div className="flex flex-col items-center gap-4 bg-white px-8 py-5 rounded-sm border border-gray-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        {/* Tailwind CSS Spinner */}
        <div className="w-7 h-7 border-[3px] border-[#e0e0e0] border-t-[#2874f0] rounded-full animate-spin"></div>
        <span className="text-[13px] font-medium text-[#878787] tracking-wide">
          Securely connecting to workspace...
        </span>
      </div>
    </div>
  </div>
);

/* ---------------- APP ENTRY POINT ---------------- */
const App = () => {
  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#212121] selection:bg-[#2874f0] selection:text-white antialiased">
      <main>
        <Suspense fallback={<InitializingSystem />}>
          <Routes>
            {/* AUTH ROUTES */}
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/signup" element={<AdminSignupPage />} />

            {/* FEATURE MODULES */}
            <Route path="/customers/*" element={<AdminInquiryRoutes />} />
            <Route path="/taruveda/*" element={<TaruvedaRoutes />} />

            {/* MAIN ADMIN PANEL */}
            <Route path="/*" element={<AdminLayoutRoutes />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
