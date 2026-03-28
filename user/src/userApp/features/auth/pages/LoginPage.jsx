import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, googleLogin, facebookLogin } = useAuth(); // ✅ googleLogin

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loginMethod, setLoginMethod] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier) return setError("Please enter your email address.");

    if (loginMethod === "password") {
      if (!form.password) return setError("Please enter your password.");

      // ✅ Firebase only accepts email for password login
      if (!form.identifier.includes("@"))
        return setError("Please enter a valid email address.");

      setLoading(true);
      setError("");
      try {
        const result = await loginUser(form.identifier, form.password); // ✅ returns {emailVerified}
        if (!result?.emailVerified) {
          navigate("/help/email-verification");
        } else {
          navigate("/");
        }
      } catch (err) {
        setError(err?.message || "Invalid credentials. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // OTP placeholder
      alert("OTP sent to " + form.identifier);
    }
  };

  const handleGoogle = async () => {
    setSocialLoading(true);
    setError(""); // ✅ was missing
    try {
      await googleLogin(); // ✅ was: googleSignup
      navigate("/");
    } catch (err) {
      setError(err?.message || "Google login failed. Please try again.");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleFacebook = async () => {
    setSocialLoading(true);
    setError("");
    try {
      await facebookLogin();
      navigate("/");
    } catch (err) {
      setError(err?.message || "Facebook login failed. Please try again.");
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 sm:pt-20 px-6 font-sans">
      <div className="w-full max-w-[360px] flex flex-col items-center relative">
        <h2 className="text-[22px] font-semibold text-gray-900 mb-2 tracking-wide text-center">
          Welcome Back
        </h2>
        <p className="text-[13px] text-gray-500 text-center leading-[1.6] mb-8 px-2">
          {loginMethod === "password"
            ? "Enter your email and password to sign in to your account."
            : "Enter your registered mobile number to receive an OTP."}
        </p>

        {/* ── Error ── */}
        {error && (
          <div className="w-full text-[#df0059] text-[13px] text-center font-medium bg-[#df0059]/5 py-2.5 rounded-[4px] border border-[#df0059]/20 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Identifier */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              type={loginMethod === "otp" ? "tel" : "email"}
              name="identifier"
              required
              value={form.identifier}
              onChange={handleChange}
              placeholder={
                loginMethod === "password" ? "Email address" : "Mobile number"
              }
              className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-4 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          {/* Password */}
          {loginMethod === "password" && (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-16 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-[#df0059] tracking-wide transition-colors p-1">
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          )}

          {/* Links Row */}
          <div className="flex items-center justify-between px-1 pt-1 pb-2">
            <button
              type="button"
              onClick={() => {
                setLoginMethod(loginMethod === "password" ? "otp" : "password");
                setError("");
                setForm({ identifier: "", password: "" });
              }}
              className="text-[12px] font-semibold text-gray-500 hover:text-[#df0059] transition-colors">
              {loginMethod === "password"
                ? "Login with OTP"
                : "Login with Password"}
            </button>
            {loginMethod === "password" && (
              <Link
                to="/auth/forgot-password"
                className="text-[12px] font-semibold text-[#df0059] hover:underline">
                Forgot Password?
              </Link>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-[#df0059] hover:bg-[#c2004d] active:scale-[0.98] text-white text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all disabled:opacity-70 flex items-center justify-center shadow-md shadow-[#df0059]/20">
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : loginMethod === "password" ? (
              "Log In"
            ) : (
              "Send OTP"
            )}
          </button>
        </form>

        {/* Social */}
        <div className="w-full mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 relative">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={socialLoading}
              className="w-full h-[48px] border border-gray-300 rounded-[4px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors active:scale-[0.98] disabled:opacity-50">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-4 h-4"
              />
              <span className="text-[13px] font-medium text-gray-700">
                Google
              </span>
            </button>
            <button
              type="button"
              onClick={handleFacebook}
              disabled={socialLoading}
              className="w-full h-[48px] border border-gray-300 rounded-[4px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors active:scale-[0.98] disabled:opacity-50">
              <img
                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                alt="Facebook"
                className="w-4 h-4"
              />
              <span className="text-[13px] font-medium text-gray-700">
                Facebook
              </span>
            </button>
          </div>

          <p className="text-[13px] text-gray-500 font-medium text-center">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-[#df0059] font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
