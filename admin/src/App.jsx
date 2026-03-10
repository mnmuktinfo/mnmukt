import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

/* ---------------- LAZY ROUTES ---------------- */
const AdminInquiryRoutes = lazy(() => import("./routes/AdminInquiryRoutes"));
const AdminLayoutRoutes = lazy(() => import("./routes/AdminLayoutRoutes"));
const TaruvedaRoutes = lazy(() => import("./routes/TaruvedaRoutes"));

const AdminSignupPage = lazy(() => import("./pages/AdminSignUpPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));

/* ---------------- PROFESSIONAL SYSTEM LOADER (FLIPKART STYLE) ---------------- */
const InitializingSystem = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f3f6] antialiased">
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
      {/* Brand Logo Box (Flipkart Style) */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#2874f0] rounded-sm flex items-center justify-center shadow-md relative overflow-hidden animate-pulse">
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

      {/* Loading Indicator */}
      <div className="flex flex-col items-center gap-3 bg-white px-8 py-4 rounded-sm border border-gray-200 shadow-sm">
        <Loader2 size={24} className="animate-spin text-[#2874f0]" />
        <span className="text-sm font-semibold text-[#878787]">
          Loading workspace...
        </span>
      </div>
    </div>
  </div>
);

/* ---------------- APP ENTRY POINT ---------------- */
const App = () => {
  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#212121] selection:bg-[#2874f0] selection:text-white antialiased">
      {/* MAIN SURFACE */}
      <main className="animate-in fade-in duration-500">
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
