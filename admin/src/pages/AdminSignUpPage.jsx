import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaArrowRight,
  FaFingerprint,
} from "react-icons/fa6";
import { BiLoaderAlt } from "react-icons/bi";
import { authService } from "../services/firebase/authService"; // New service below
import Notification from "../components/notification/Notification";

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.registerAdmin(form);
      setNotification({
        type: "success",
        message: "Registry Authorized: Check Email.",
      });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Authorization Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[1000px] bg-white border border-slate-200 rounded-sm shadow-2xl flex overflow-hidden min-h-[600px]">
        {/* LEFT: BRAND & SECURITY INFO */}
        <div className="hidden md:flex w-1/2 bg-slate-950 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff356c] opacity-10 blur-[100px] -mr-32 -mt-32" />

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-sm flex items-center justify-center text-[#ff356c] font-black text-2xl italic font-serif mb-8 shadow-xl">
              M
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
              Control <br /> <span className="text-[#ff356c]">Registry.</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-6">
              Secure Admin Gateway // 2026
            </p>
          </div>

          <div className="relative z-10 border-l border-white/10 pl-6 space-y-4">
            <p className="text-white font-bold text-sm tracking-tight italic font-serif">
              "Precision is the foundation of luxury management."
            </p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#ff356c]">
              <FaFingerprint /> Biometric Encrypted
            </div>
          </div>
        </div>

        {/* RIGHT: AUTHORIZATION FORM */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-widest flex items-center gap-3">
              <FaUserShield className="text-[#ff356c]" /> New Access
            </h2>
            <p className="text-slate-400 text-[11px] font-bold uppercase mt-2 tracking-widest">
              Initialize Admin Credentials
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <AuthInput
                icon={<FaUserShield />}
                name="name"
                placeholder="FULL NAME"
                value={form.name}
                onChange={handleChange}
                required
              />
              <AuthInput
                icon={<FaPhone />}
                name="phone"
                type="tel"
                placeholder="CONTACT NUMBER"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <AuthInput
                icon={<FaEnvelope />}
                name="email"
                type="email"
                placeholder="ADMIN EMAIL"
                value={form.email}
                onChange={handleChange}
                required
              />

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff356c] transition-colors">
                  <FaLock size={14} />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="AUTHORIZATION KEY"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border-none py-3.5 pl-12 pr-12 text-[11px] font-black tracking-[0.2em] outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                  {showPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-[#ff356c] text-white py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-300 shadow-xl shadow-slate-100">
              {loading ? (
                <BiLoaderAlt className="animate-spin text-lg" />
              ) : (
                <>
                  <FaCheck /> Authorize Account
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center mt-10 text-slate-400">
            Existing Admin?{" "}
            <Link to="/login" className="text-[#ff356c] hover:underline ml-2">
              Identify
            </Link>
          </p>
        </div>
      </div>

      {notification && (
        <Notification {...notification} onClose={() => setNotification(null)} />
      )}
    </div>
  );
};

/* --- UTILITY INPUT COMPONENT --- */
const AuthInput = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ff356c] transition-colors">
      {icon}
    </div>
    <input
      {...props}
      className="w-full bg-slate-50 border-none py-3.5 pl-12 pr-4 text-[11px] font-black tracking-[0.2em] outline-none focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-900 uppercase"
    />
  </div>
);

export default AdminSignupPage;
