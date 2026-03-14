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

  const [emailLoading, setEmailLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const anyLoading = emailLoading || socialLoading;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  /* ── Email login ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setError("");
    try {
      await loginUser(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  /* ── Google login ── */
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

  /* ── Facebook login ── */
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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-sans selection:bg-[#da127d] selection:text-white">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10">
        {/* ── Premium Header ── */}
        <div className="text-center mb-8">
          <h2
            className="text-3xl text-gray-900 tracking-wide mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome Back
          </h2>
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-widest">
            Sign in to your account
          </p>
        </div>

        {/* ── Error Notification ── */}
        {error && (
          <div className="bg-[#F9F5F6] text-[#da127d] text-[13px] font-medium p-3.5 rounded-sm mb-6 text-center border border-[#da127d]/20 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* ── Email Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3.5 text-[14px] text-gray-900 outline-none focus:bg-white focus:border-[#da127d] focus:ring-1 focus:ring-[#da127d] transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3.5 pr-14 text-[14px] text-gray-900 outline-none focus:bg-white focus:border-[#da127d] focus:ring-1 focus:ring-[#da127d] transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-[#da127d] transition-colors">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <Link
              to="/auth/forgot-password"
              className="text-[12px] font-medium text-gray-500 hover:text-[#da127d] transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={anyLoading}
            className="w-full bg-[#da127d] hover:bg-[#b80f6a] text-white text-[13px] font-bold uppercase tracking-[0.2em] py-4 rounded-sm transition-all duration-300 shadow-md hover:shadow-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {emailLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-[1px] bg-gray-100" />
          <span className="px-4 text-[11px] font-bold text-gray-300 uppercase tracking-widest">
            Or continue with
          </span>
          <div className="flex-1 h-[1px] bg-gray-100" />
        </div>

        {/* ── Social Login Buttons ── */}
        <div className="flex justify-center gap-8 mb-8">
          {/* Facebook */}
          <div className="flex flex-col items-center gap-3 cursor-pointer group">
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={anyLoading}
              className="w-[56px] h-[56px] rounded-full bg-[#1877F2] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 disabled:opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white">
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
              </svg>
            </button>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">
              {socialLoading ? "Wait..." : "Facebook"}
            </span>
          </div>

          {/* Google */}
          <div className="flex flex-col items-center gap-3 cursor-pointer group">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={anyLoading}
              className="w-[56px] h-[56px] rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 disabled:opacity-50">
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
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">
              {socialLoading ? "Wait..." : "Google"}
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[13px] text-gray-500">
          New to our store?{" "}
          <Link
            to="/auth/signup"
            className="text-[#da127d] font-semibold hover:text-[#b80f6a] transition-colors">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
