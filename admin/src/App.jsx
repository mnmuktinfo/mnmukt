import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import AdminNavbar from "./components/AdminNavbar"; // Your updated Navbar
import AdminInquiryRoutes from "./routes/AdminInquiryRoutes";
import AdminLayoutRoutes from "./routes/AdminLayoutRoutes";
import AdminSignupPage from "./pages/AdminSignUpPage";
import AdminLoginPage from "./pages/AdminLoginPage";

// High-Performance Lazy Loading
// const Dashboard = lazy(() => import("./pages/Dashboard"));
// const Products = lazy(() => import("./pages/Products"));
// const Orders = lazy(() => import("./pages/Orders"));
// const Settings = lazy(() => import("./pages/Settings"));

// Elite Architectural Loader
const InitializingSystem = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
    <div className="w-[1px] h-24 bg-slate-100 animate-pulse mb-6" />
    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 animate-pulse">
      Syncing Command Central
    </p>
  </div>
);

const App = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] font-sans text-slate-900 selection:bg-[#ff356c] selection:text-white">
      {/* Persistent Admin Interface */}

      {/* Main Command Surface */}
      <main className="animate-in fade-in duration-1000">
        <Suspense fallback={<InitializingSystem />}>
          <Routes>
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/signup" element={<AdminSignupPage />} />
            <Route path="/customers/*" element={<AdminInquiryRoutes />} />
            <Route path="/*" element={<AdminLayoutRoutes />} />
          </Routes>
        </Suspense>
      </main>

      {/* Footer HUD */}
      <footer className="max-w-[1600px] mx-auto px-12 py-10 border-t border-slate-50 flex justify-between items-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-widest">
          Mnmukt Registry Control
        </p>
        <p className="text-[8px] font-bold uppercase tracking-tighter">
          Secure Admin Session // 2026
        </p>
      </footer>
    </div>
  );
};

export default App;
