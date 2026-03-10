import { lazy } from "react";

/* =========================
   Pages (Lazy Loaded)
   Improves initial load time
========================== */
export const LoginPage = lazy(() => import("./pages/LoginPage"));
export const SignupPage = lazy(() => import("./pages/SignupPage"));
// export const ForgotPasswordPage = lazy(
//   () => import("./pages/ForgotPasswordPage"),
// );
// export const VerifyOtpPage = lazy(() => import("./pages/VerifyOtpPage"));
// export const ResetPasswordPage = lazy(
//   () => import("./pages/ResetPasswordPage"),
// );

/* =========================
  Hooks
========================== */
// export { useAuth } from "./hooks/useAuth";
