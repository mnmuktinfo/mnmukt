import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "../features/auth/context/UserContext";

/* ─── Lazy Pages ─────────────────────────────────────────────────────────── */
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"));
const ForgotPasswordPage = lazy(
  () => import("../features/auth/pages/ForgotPasswordPage"),
); // ✅ now lazy
const FirebaseActionPage = lazy(
  () => import("../features/auth/pages/Emailverifypage"),
);

/* ─── Loader ─────────────────────────────────────────────────────────────── */
const Loader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-10 h-10 border-4 border-[#da127d] border-t-transparent rounded-full animate-spin" />
  </div>
);

/* ─── Public-only guard ──────────────────────────────────────────────────── */
// ✅ waits for Firebase auth to resolve before deciding to redirect
const PublicOnlyRoute = ({ isLoggedIn, authLoading, children }) => {
  if (authLoading) return <Loader />;
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

/* ─── AuthRoutes ─────────────────────────────────────────────────────────── */
export default function AuthRoutes() {
  const { isLoggedIn, authLoading } = useAuth(); // ✅ added authLoading

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Login */}
        <Route
          path="login"
          element={
            <PublicOnlyRoute isLoggedIn={isLoggedIn} authLoading={authLoading}>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        {/* Signup */}
        <Route
          path="signup"
          element={
            <PublicOnlyRoute isLoggedIn={isLoggedIn} authLoading={authLoading}>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        {/* Forgot Password — no auth guard needed */}
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        {/* Firebase Action handler (email verify / password reset links) */}
        {/* ✅ Keep here OR in AppRoutes — not both. Keeping here is fine. */}
        <Route path="action" element={<FirebaseActionPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </Suspense>
  );
}
