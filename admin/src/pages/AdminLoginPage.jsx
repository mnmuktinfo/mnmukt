import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaBox } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { authService } from "../services/firebase/authService";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Integration with your Firebase Auth Service
      await authService.login(formData.email, formData.password);

      setTimeout(() => {
        setLoading(false);
        navigate("/products");
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError("Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px]">
        {/* LOGO SECTION (Identical to SignUp) */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-600 p-3 rounded-2xl text-white shadow-lg shadow-green-100 mb-4">
            <FaBox size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AdminPanel</h1>
          <p className="text-gray-400 text-sm mt-1">
            Please sign in to your account
          </p>
        </div>

        {/* LOGIN CARD (Identical styling to SignUp) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@store.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all text-sm"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-bold text-blue-600 hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all text-sm"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <BiLoaderAlt className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* REDIRECT TO SIGNUP (Matching the Link style in SignUp) */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Register Admin
              </Link>
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-gray-400 text-xs mt-8">
          &copy; 2026 Mnmukt Admin Panel Design.
          <br /> All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
