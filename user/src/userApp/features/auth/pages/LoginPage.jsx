import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginUser,
  googleSignup,
  facebookLogin,
} from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIX 3: split loading — email and social are independent actions
  const [emailLoading, setEmailLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const anyLoading = emailLoading || socialLoading;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  /* ── Email login ─────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError("");
    try {
      await loginUser(form.email, form.password);
      // ✅ FIX 2: AuthContext's onAuthStateChanged fires and updates state.
      // Navigate after login — context will be ready by the time the new
      // route renders because onAuthStateChanged is synchronous within the session.
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  /* ── Google login ────────────────────────────────────────── */
  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    setError("");
    try {
      await googleSignup();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSocialLoading(false);
    }
  };

  /* ── Facebook login ──────────────────────────────────────── */
  // ✅ FIX 1: wired to facebookLogin from authService
  const handleFacebookLogin = async () => {
    setSocialLoading(true);
    setError("");
    try {
      await facebookLogin();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 pt-8 md:p-8">
        {/* Header */}
        <h2 className="text-[22px] font-bold text-[#1f2937] mb-6 text-center">
          Login / Signup
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-[#f15757] text-[13px] font-medium p-3 rounded-sm mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full border border-gray-300 rounded-sm px-4 py-3.5 text-[14px] text-gray-800 outline-none focus:border-[#f15757] transition-colors placeholder:text-gray-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-sm px-4 py-3.5 pr-14 text-[14px] text-gray-800 outline-none focus:border-[#f15757] transition-colors placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#f15757] transition-colors">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <Link
              to="/auth/forgot-password"
              className="text-[12px] font-medium text-gray-500 hover:text-[#f15757] transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={anyLoading}
            className="w-full bg-[#f15757] hover:bg-[#e04848] text-white text-[14px] font-bold uppercase tracking-wide py-3.5 rounded-sm transition-colors shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {emailLoading ? "Authenticating..." : "Continue"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-[1px] bg-gray-200" />
          <span className="px-4 text-[13px] font-bold text-gray-400 uppercase">
            OR
          </span>
          <div className="flex-1 h-[1px] bg-gray-200" />
        </div>

        {/* Social buttons */}
        <div className="flex justify-center gap-12 mb-8">
          {/* ✅ FIX 1: Facebook wired to handleFacebookLogin */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={anyLoading}
              className="w-[52px] h-[52px] rounded-full bg-[#3b5998] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow disabled:opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white">
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
              </svg>
            </button>
            {/* ✅ FIX 3: show spinner only on social loading */}
            <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
              {socialLoading ? "..." : "Facebook"}
            </span>
          </div>

          {/* Google */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={anyLoading}
              className="w-[52px] h-[52px] rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.08)] group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)] transition-shadow disabled:opacity-50">
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
            </button>
            <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
              {socialLoading ? "..." : "Google"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] text-gray-500">
          New here?{" "}
          <Link
            to="/auth/signup"
            className="text-[#f15757] font-bold hover:underline transition-all">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
