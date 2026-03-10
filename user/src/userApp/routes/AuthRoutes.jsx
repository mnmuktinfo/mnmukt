import { Routes, Route, Navigate } from "react-router-dom";
import { lazy } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";

/* Lazy load auth pages */
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"));

/* Public-only guard */
const PublicOnlyRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

export default function AuthRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="login"
        element={
          <PublicOnlyRoute isLoggedIn={isLoggedIn}>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="signup"
        element={
          <PublicOnlyRoute isLoggedIn={isLoggedIn}>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />

      {/* <Route path="email-verification" element={<EmailVerification />} /> */}

      {/* Default redirect to login if route not found */}
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
}
