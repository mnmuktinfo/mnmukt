import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

// ── Password Strength Checker ──
const getPasswordStrength = (password) => {
  if (!password)
    return { score: 0, label: "No password", color: "bg-gray-200" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strengthMap = {
    0: { label: "Very weak", color: "bg-red-500" },
    1: { label: "Weak", color: "bg-red-400" },
    2: { label: "Fair", color: "bg-yellow-500" },
    3: { label: "Good", color: "bg-yellow-400" },
    4: { label: "Strong", color: "bg-lime-500" },
    5: { label: "Very strong", color: "bg-green-500" },
    6: { label: "Very strong", color: "bg-green-600" },
  };

  return { score: Math.min(score, 6), ...strengthMap[Math.min(score, 6)] };
};

// ── Email Validation ──
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

// ── Admin Auth Page ──
export default function AdminAuthPage() {
  const navigate = useNavigate();
  const {
    login,
    register,
    loading,
    error: authError,
    sessionExpiring,
    extendSession,
  } = useAdminAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [ui, setUI] = useState({
    showPassword: false,
    showConfirmPassword: false,
    touched: {},
    errors: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Validation on blur ──
  const validateField = (name, value) => {
    const newErrors = { ...ui.errors };

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email is required";
      } else if (!isValidEmail(value)) {
        newErrors.email = "Enter a valid email address";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else if (!isLogin && value.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!isLogin && !/[A-Z]/.test(value)) {
        newErrors.password = "Password must include an uppercase letter";
      } else if (!isLogin && !/[0-9]/.test(value)) {
        newErrors.password = "Password must include a number";
      } else {
        delete newErrors.password;
      }
    }

    if (name === "confirmPassword" && !isLogin) {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (value !== form.password) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (name === "name" && !isLogin) {
      if (!value.trim()) {
        newErrors.name = "Name is required";
      } else if (value.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      } else {
        delete newErrors.name;
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Real-time validation for password strength feedback
    if (name === "password" || name === "confirmPassword") {
      const errors = validateField(name, value);
      setUI((prev) => ({ ...prev, errors }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setUI((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));

    const errors = validateField(name, form[name]);
    setUI((prev) => ({ ...prev, errors }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setUI({
      showPassword: false,
      showConfirmPassword: false,
      touched: {},
      errors: {},
    });
  };

  // ── Form submission ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all fields
      const emailErrors = validateField("email", form.email);
      const passwordErrors = validateField("password", form.password);
      let allErrors = { ...emailErrors, ...passwordErrors };

      if (!isLogin) {
        const nameErrors = validateField("name", form.name);
        const confirmErrors = validateField(
          "confirmPassword",
          form.confirmPassword,
        );
        allErrors = { ...allErrors, ...nameErrors, ...confirmErrors };
      }

      if (Object.keys(allErrors).length > 0) {
        setUI((prev) => ({
          ...prev,
          errors: allErrors,
          touched: {
            email: true,
            password: true,
            confirmPassword: !isLogin,
            name: !isLogin,
          },
        }));
        setIsSubmitting(false);
        return;
      }

      if (isLogin) {
        await login(form.email.toLowerCase(), form.password);
        navigate("/");
      } else {
        await register(
          form.email.toLowerCase(),
          form.password,
          form.name.trim(),
        );
        setIsLogin(true);
        setForm({ name: "", email: "", password: "", confirmPassword: "" });
        setUI({
          showPassword: false,
          showConfirmPassword: false,
          touched: {},
          errors: {},
        });
      }
    } catch (err) {
      // Error is handled by context and displayed in authError
      console.error("Auth error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);
  const canSubmit =
    !isSubmitting &&
    !loading &&
    form.email &&
    form.password &&
    (isLogin || (form.name && form.confirmPassword));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Session Expiring Modal */}
      {sessionExpiring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-6 border border-red-200">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Session Expiring Soon
                </h3>
                <p className="text-sm text-gray-600">
                  Your session will expire in 5 minutes due to inactivity.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => extendSession(form.email)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Continue Session
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm text-gray-600">
                {isLogin
                  ? "Sign in to access your admin dashboard"
                  : "Register a new administrator account"}
              </p>
            </div>

            {/* Error Alert */}
            {authError && (
              <div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                role="alert"
                aria-live="polite">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{authError}</p>
              </div>
            )}

            {/* Success Message (after registration) */}
            {!isLogin && !authError && form.email && (
              <div
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                role="status"
                aria-live="polite">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 font-medium">
                  Registration successful! Log in with your credentials.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Name Field (Register Only) */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      aria-invalid={ui.touched.name && !!ui.errors.name}
                      aria-describedby={
                        ui.errors.name ? "name-error" : undefined
                      }
                      className={`w-full h-11 pl-10 pr-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                        ui.touched.name && ui.errors.name
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  {ui.touched.name && ui.errors.name && (
                    <p
                      id="name-error"
                      className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {ui.errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="admin@example.com"
                    aria-invalid={ui.touched.email && !!ui.errors.email}
                    aria-describedby={
                      ui.errors.email ? "email-error" : undefined
                    }
                    className={`w-full h-11 pl-10 pr-4 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      ui.touched.email && ui.errors.email
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                </div>
                {ui.touched.email && ui.errors.email && (
                  <p
                    id="email-error"
                    className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {ui.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type={ui.showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    aria-invalid={ui.touched.password && !!ui.errors.password}
                    aria-describedby={
                      ui.errors.password
                        ? "password-error"
                        : !isLogin && form.password
                          ? "password-strength"
                          : undefined
                    }
                    className={`w-full h-11 pl-10 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                      ui.touched.password && ui.errors.password
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setUI((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors"
                    aria-label={
                      ui.showPassword ? "Hide password" : "Show password"
                    }>
                    {ui.showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator (Register) */}
                {!isLogin && form.password && (
                  <div id="password-strength" className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${passwordStrength.color}`}
                          style={{
                            width: `${(passwordStrength.score / 6) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li
                        className={
                          form.password.length >= 8 ? "text-green-600" : ""
                        }>
                        ✓ At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(form.password) ? "text-green-600" : ""
                        }>
                        ✓ Uppercase letter
                      </li>
                      <li
                        className={
                          /[0-9]/.test(form.password) ? "text-green-600" : ""
                        }>
                        ✓ Number
                      </li>
                    </ul>
                  </div>
                )}

                {ui.touched.password && ui.errors.password && (
                  <p
                    id="password-error"
                    className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {ui.errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Register Only) */}
              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="confirmPassword"
                      type={ui.showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      aria-invalid={
                        ui.touched.confirmPassword &&
                        !!ui.errors.confirmPassword
                      }
                      aria-describedby={
                        ui.errors.confirmPassword
                          ? "confirm-password-error"
                          : undefined
                      }
                      className={`w-full h-11 pl-10 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 transition-all focus:bg-white focus:ring-2 focus:outline-none ${
                        ui.touched.confirmPassword && ui.errors.confirmPassword
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setUI((prev) => ({
                          ...prev,
                          showConfirmPassword: !prev.showConfirmPassword,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 transition-colors"
                      aria-label={
                        ui.showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }>
                      {ui.showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {ui.touched.confirmPassword && ui.errors.confirmPassword && (
                    <p
                      id="confirm-password-error"
                      className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {ui.errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                aria-busy={isSubmitting}
                className="w-full h-11 mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md">
                {isSubmitting || loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="mt-8 text-center border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  onClick={toggleMode}
                  disabled={isSubmitting || loading}
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1">
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Protected by enterprise-grade security. Your data is encrypted in
          transit and at rest.
        </p>
      </div>
    </div>
  );
}
