import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../features/auth/context/UserContext";

const LoginPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { loginUser, googleLogin, facebookLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const close = () => onClose();
  const anyLoading = loading !== null;

  /* ── Handlers ── */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading("email");
    setError("");
    try {
      const result = await loginUser(email.trim(), password);
      if (!result?.emailVerified) {
        close();
        navigate("/help/email-verification");
      } else {
        close();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setLoading("google");
    setError("");
    try {
      await googleLogin();
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

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
    // Overlay
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-5 animate-[fadeIn_0.2s_ease-out]"
      onClick={close}>
      {/* Modal */}
      <div
        className="bg-white w-full max-w-[400px] shadow-2xl p-8 relative rounded-none animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="absolute top-5 right-5 w-8 h-8 bg-gray-50 border-none flex items-center justify-center text-gray-500 cursor-pointer transition-all hover:bg-pink-50 hover:text-pink-600 hover:scale-105 rounded-none"
          onClick={close}
          aria-label="Close">
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl text-gray-900 leading-tight mb-2 font-normal">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Sign in to your account to continue shopping.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 py-3 px-4 text-[13px] font-medium text-center mb-5 rounded-none">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="Email Address"
              className="peer w-full h-[52px] bg-white border border-gray-300 px-12 text-[15px] text-gray-900 outline-none transition-all shadow-sm hover:border-gray-400 focus:border-pink-600 focus:ring-4 focus:ring-pink-600/15 rounded-none"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={anyLoading}
            />
            <Mail
              size={20}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors peer-focus:text-pink-600"
            />
          </div>

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              placeholder="Password"
              className="peer w-full h-[52px] bg-white border border-gray-300 pl-12 pr-12 text-[15px] text-gray-900 outline-none transition-all shadow-sm hover:border-gray-400 focus:border-pink-600 focus:ring-4 focus:ring-pink-600/15 rounded-none"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={anyLoading}
            />
            <Lock
              size={20}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors peer-focus:text-pink-600"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-none p-1 cursor-pointer flex transition-colors hover:text-gray-900 rounded-none"
              onClick={() => setShowPass(!showPass)}
              tabIndex="-1">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end -mt-1">
            <button
              type="button"
              className="bg-transparent border-none cursor-pointer text-xs font-semibold text-pink-600 transition-colors hover:text-pink-700 hover:underline rounded-none"
              onClick={() => {
                close();
                navigate("/auth/forgot-password");
              }}>
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-[52px] mt-2 bg-pink-600 text-white border-none text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_12px_rgba(223,0,89,0.25)] hover:bg-pink-700 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(223,0,89,0.35)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(223,0,89,0.2)] disabled:opacity-70 disabled:cursor-not-allowed rounded-none"
            disabled={anyLoading}>
            {loading === "email" ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Sign In Securely"
            )}
          </button>
        </form>

        {/* Social Logins */}
        <div className="flex items-center text-center my-6 text-gray-400 text-xs font-semibold tracking-wider uppercase before:content-[''] before:flex-1 before:border-b before:border-gray-200 before:mr-3 after:content-[''] after:flex-1 after:border-b after:border-gray-200 after:ml-3">
          Or continue with
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-300 text-sm font-medium text-gray-900 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-none"
            onClick={handleGoogle}
            disabled={anyLoading}>
            {loading === "google" ? (
              <Loader2 className="animate-spin text-gray-600" size={18} />
            ) : (
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                style={{ width: 18, height: 18 }}
              />
            )}
            Google
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-300 text-sm font-medium text-gray-900 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-none"
            onClick={handleFacebook}
            disabled={anyLoading}>
            {loading === "facebook" ? (
              <Loader2 className="animate-spin text-gray-600" size={18} />
            ) : (
              <img
                src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                alt="Facebook"
                style={{ width: 18, height: 18 }}
              />
            )}
            Facebook
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          New to our store?
          <button
            type="button"
            className="bg-transparent border-none cursor-pointer text-pink-600 font-semibold ml-1 transition-colors hover:text-pink-700 hover:underline rounded-none"
            onClick={() => {
              close();
              navigate("/auth/signup");
            }}>
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
