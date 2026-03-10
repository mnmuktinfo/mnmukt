import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, googleSignup } from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = {
    primary: "#ff356c",
    text: "#2d3748",
    muted: "#94a3b8",
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginUser(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await googleSignup();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left">
          <div className="w-8 h-8 border-2 border-[#ff356c] rounded-full mb-6 flex items-center justify-center mx-auto md:mx-0">
            <div className="w-1 h-1 bg-[#ff356c] rounded-full" />
          </div>
          <h1 className="text-4xl font-light tracking-tighter mb-2">
            Welcome{" "}
            <span className="italic font-serif text-[#ff356c]">Back.</span>
          </h1>
          <p className="text-slate-400 text-sm tracking-wide">
            Enter your details to access your account.
          </p>
        </header>

        {/* Action Section */}
        <div className="space-y-8">
          {/* Google Auth - Minimalist */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 border border-slate-100 rounded-sm flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] font-bold text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.59,17.03 6.59,12C6.59,6.97 9.06,4.73 12.18,4.73C14.4,4.73 16.31,5.77 17.22,7.39L19.41,5.7C18.15,3.46 15.42,2 12.18,2C6.82,2 4,6.59 4,12C4,17.41 6.82,22 12.18,22C17.3,22 21.5,18.33 21.5,12C21.5,11.54 21.41,11.1 21.35,11.1V11.1Z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-50"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase tracking-[0.3em] text-slate-300">
              or email
            </span>
            <div className="flex-grow border-t border-slate-50"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <p className="text-[#ff356c] text-[10px] uppercase tracking-widest font-bold text-center">
                {error}
              </p>
            )}

            <div className="relative">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 block mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] uppercase tracking-widest text-[#ff356c] font-bold">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
              />
            </div>

            <div className="pt-4 space-y-6">
              <button
                disabled={loading}
                className="w-full py-5 bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#ff356c] transition-all disabled:opacity-50">
                {loading ? "Authenticating..." : "Sign In"}
              </button>

              <div className="flex flex-col items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold">
                <Link
                  to="/auth/forgot-password"
                  size="sm"
                  className="text-slate-300 hover:text-[#ff356c]">
                  Forgot Password?
                </Link>
                <p className="text-slate-300">
                  New here?{" "}
                  <Link to="/auth/signup" className="text-[#ff356c]">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
