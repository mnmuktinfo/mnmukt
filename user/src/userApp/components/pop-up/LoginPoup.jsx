import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  loginUser,
  googleSignup,
  facebookLogin,
} from "../../features/auth/services/authService";

const LoginPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(null); // null | "email" | "google" | "facebook"
  const [error, setError] = useState("");

  if (!isOpen) return null; // don't render if not open

  const close = () => onClose();
  const anyLoading = loading !== null;

  /* ── Email + Password login ──────────────────────────────── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading("email");
    setError("");
    try {
      await loginUser(email.trim(), password);
      close(); // AuthContext's onAuthStateChanged handles state update
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /* ── Google ──────────────────────────────────────────────── */
  const handleGoogle = async () => {
    setLoading("google");
    setError("");
    try {
      await googleSignup();
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /* ── Facebook ────────────────────────────────────────────── */
  const handleFacebook = async () => {
    setLoading("facebook");
    setError("");
    try {
      await facebookLogin();
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-full md:w-[420px] bg-white  md:rounded-sm shadow-2xl p-6 pt-8 md:p-8 animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        {/* Close */}
        <button
          onClick={close}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors">
          <X size={24} strokeWidth={1.5} />
        </button>

        {/* Header */}
        <h2 className="text-[22px] font-bold text-[#1f2937] mb-6">
          Login / Signup
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-[#f15757] text-[13px] font-medium p-3 rounded-sm mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Email + Password form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          {/* Email */}
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={anyLoading}
            className="w-full border border-gray-300 rounded-sm px-4 py-3.5 text-[14px] text-gray-800 outline-none focus:border-[#f15757] transition-colors placeholder:text-gray-400 disabled:opacity-60"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={anyLoading}
              className="w-full border border-gray-300 rounded-sm px-4 py-3.5 pr-14 text-[14px] text-gray-800 outline-none focus:border-[#f15757] transition-colors placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#f15757] transition-colors">
              {showPass ? "Hide" : "Show"}
            </button>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                close();
                navigate("/auth/forgot-password");
              }}
              className="text-[12px] font-medium text-gray-500 hover:text-[#f15757] transition-colors">
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={anyLoading}
            className="w-full bg-[#f15757] hover:bg-[#e04848] text-white text-[14px] font-bold uppercase tracking-wide py-3.5 rounded-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
            {loading === "email" ? "Logging in..." : "Continue"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-gray-200" />
          <span className="px-4 text-[13px] font-bold text-gray-500 uppercase">
            OR
          </span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        {/* Social buttons */}
        <div className="flex justify-center gap-12 mb-4">
          {/* Facebook */}
          <div
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={!anyLoading ? handleFacebook : undefined}>
            <div
              className={`w-[52px] h-[52px] rounded-full bg-[#3b5998] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow ${anyLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loading === "facebook" ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="white">
                  <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
                </svg>
              )}
            </div>
            <span className="text-[12px] font-medium text-gray-600 uppercase tracking-wide">
              {loading === "facebook" ? "..." : "Facebook"}
            </span>
          </div>

          {/* Google */}
          <div
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={!anyLoading ? handleGoogle : undefined}>
            <div
              className={`w-[52px] h-[52px] rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.08)] group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)] transition-shadow ${anyLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loading === "google" ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#f15757] border-t-transparent animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
              )}
            </div>
            <span className="text-[12px] font-medium text-gray-600 uppercase tracking-wide">
              {loading === "google" ? "..." : "Google"}
            </span>
          </div>
        </div>

        {/* Signup link */}
        <p className="text-center text-[13px] text-gray-500 mt-4">
          New here?{" "}
          <button
            onClick={() => {
              close();
              navigate("/auth/signup");
            }}
            className="text-[#f15757] font-bold hover:underline transition-all">
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;
