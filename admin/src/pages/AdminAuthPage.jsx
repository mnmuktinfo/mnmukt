import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminAuthPage() {
  const navigate = useNavigate();
  const { login, register, loading: authLoading } = useAdminAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Toggle between login and register mode
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setError("");
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.email.includes("@")) return setError("Enter a valid email.");
    if (!form.password) return setError("Enter a password.");
    if (!isLogin && form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (!isLogin && form.password !== form.confirmPassword)
      return setError("Passwords do not match.");

    setError("");

    try {
      if (isLogin) {
        await login(form.email, form.password);
        navigate("/"); // Redirect on successful login
      } else {
        await register(form.email, form.password, form.name);
        setIsLogin(true);
        setError("Admin registered successfully! Please log in.");
      }
    } catch (err) {
      setError(err?.message || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-white overflow-hidden transition-all duration-300">
        <div className="p-8 sm:p-10">
          {/* Header Text */}
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            {isLogin ? "Admin Portal" : "Create Admin"}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            {isLogin
              ? "Sign in to access the administrator dashboard."
              : "Register a new administrator account."}
          </p>

          {/* Error / Success Message */}
          {error && (
            <div
              className={`text-center py-3 px-4 mb-6 text-sm rounded-lg font-medium transition-all ${
                error.toLowerCase().includes("registered")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (only in register) */}
            {!isLogin && (
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors"
                size={20}
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Admin Email"
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full h-12 pl-12 pr-16 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-pink-600 transition-colors focus:outline-none">
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            {/* Confirm Password (register only) */}
            {!isLogin && (
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full h-12 pl-12 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-12 mt-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin
                ? "Need a new admin account?"
                : "Already have an account?"}{" "}
              <button
                className="text-pink-600 font-semibold hover:text-pink-700 hover:underline transition-all focus:outline-none"
                onClick={toggleMode}>
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
