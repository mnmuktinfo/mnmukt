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

  if (!isOpen) return null;

  const close = () => onClose();
  const anyLoading = loading !== null;

  /* ── Email + Password login ── */
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
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  /* ── Google ── */
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

  /* ── Facebook ── */
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
    <div className="fixed inset-0 z-9999 flex items-end justify-center md:items-center font-sans selection:bg-[#da127d] selection:text-white">
      {/* ── Cinematic Backdrop ── */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={close}
      />

      {/* ── Modal Container ── */}
      <div className="relative w-full md:w-[440px] bg-white shadow-2xl p-8 md:p-10 animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-500">
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-[#da127d] hover:bg-[#F9F5F6] transition-all duration-300">
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* ── Premium Header ── */}
        <div className="text-center mb-8">
          <h2
            className="text-3xl text-gray-900 tracking-wide mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome Back
          </h2>
          <p className="text-[12px] font-semibold text-gray-600 uppercase tracking-widest">
            Sign in to your account
          </p>
        </div>

        {/* ── Error Notification ── */}
        {error && (
          <div className="bg-[#F9F5F6] text-[#da127d] text-[13px] font-medium p-3.5 rounded-sm mb-6 text-center border border-[#da127d]/20 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* ── Email + Password Form ── */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          {/* Email */}
          <div>
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
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:bg-white focus:border-[#da127d] focus:ring-1 focus:ring-[#da127d] transition-all placeholder:text-gray-500 disabled:opacity-60"
            />
          </div>

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
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3.5 pr-14 text-[14px] text-gray-900 outline-none focus:bg-white focus:border-[#da127d] focus:ring-1 focus:ring-[#da127d] transition-all placeholder:text-gray-500 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-[#da127d] transition-colors">
              {showPass ? "Hide" : "Show"}
            </button>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                close();
                navigate("/auth/forgot-password");
              }}
              className="text-[12px] font-semibold text-gray-600 hover:text-[#da127d] transition-colors">
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={anyLoading}
            className="w-full bg-[#da127d] hover:bg-[#b80f6a] text-white text-[13px] font-bold uppercase tracking-[0.2em] py-4 rounded-sm transition-all duration-300 shadow-md hover:shadow-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading === "email" ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-[1px] bg-gray-200" />
          <span className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            Or continue with
          </span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        {/* ── Social Buttons ── */}
        <div className="flex justify-center gap-10 mb-4">
          {/* Facebook */}
          <div
            className="flex flex-col items-center gap-3 cursor-pointer group"
            onClick={!anyLoading ? handleFacebook : undefined}>
            <div
              className={`w-[56px] h-[56px] rounded-full bg-[#1877F2] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 ${anyLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
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
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide group-hover:text-gray-900 transition-colors">
              {loading === "facebook" ? "Wait..." : "Facebook"}
            </span>
          </div>

          {/* Google */}
          <div
            className="flex flex-col items-center gap-3 cursor-pointer group"
            onClick={!anyLoading ? handleGoogle : undefined}>
            <div
              className={`w-[56px] h-[56px] rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.08)] group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:-translate-y-1 ${anyLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {loading === "google" ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#da127d] border-t-transparent animate-spin" />
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
            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide group-hover:text-gray-900 transition-colors">
              {loading === "google" ? "Wait..." : "Google"}
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[13px] text-gray-600 mt-6">
          New to our store?{" "}
          <button
            onClick={() => {
              close();
              navigate("/auth/signup");
            }}
            className="text-[#da127d] font-semibold hover:text-[#b80f6a] transition-colors">
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPopup;
