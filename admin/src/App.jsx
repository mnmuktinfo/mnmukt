import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

/* ── Components ── */
const ProtectedRoute = lazy(() => import("./routes/ProtectedRoute"));
const AdminAuthPage = lazy(() => import("./pages/AdminAuthPage"));

/* ── Lazy Routes ── */
const AdminInquiryRoutes = lazy(() => import("./routes/AdminInquiryRoutes"));
const AdminLayoutRoutes = lazy(() => import("./routes/AdminLayoutRoutes"));
const TaruvedaRoutes = lazy(() => import("./routes/TaruvedaRoutes"));

/* ── Ultra-Fast Loading Screen ── */
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 antialiased fixed inset-0 z-[9999]">
    <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 ease-out">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden">
          <span className="text-white font-bold text-2xl">M</span>
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white">Mnmukt</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Seller Hub
          </span>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-sm px-8 py-6 rounded-xl border border-white/20">
        <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-sm font-medium text-white/80 tracking-wide">
          Securing your workspace...
        </span>
      </div>
    </div>
  </div>
);

/* ── Page Not Found ── */
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-200">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-600 mb-6">
        The page you're looking for doesn't exist.
      </p>
      <a
        href="/"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
        Go to Dashboard
      </a>
    </div>
  </div>
);

/* ── Main App Component ── */
function App() {
  const location = useLocation();

  // Log navigation
  useEffect(() => {
    console.debug(`Navigated to: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-blue-600 selection:text-white antialiased">
        <AdminAuthProvider>
          <main className="relative">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/auth" element={<AdminAuthPage />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/customers/*"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProtectedRoute>
                        <AdminInquiryRoutes />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />

                <Route
                  path="/taruveda/*"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProtectedRoute>
                        <TaruvedaRoutes />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />

                {/* Protected Dashboard Routes */}
                <Route
                  path="/*"
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ProtectedRoute>
                        <AdminLayoutRoutes />
                      </ProtectedRoute>
                    </Suspense>
                  }
                />

                {/* Fallback Routes */}
                <Route path="/not-found" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
        </AdminAuthProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
