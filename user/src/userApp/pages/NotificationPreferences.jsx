import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Smartphone,
  ShieldCheck,
  Bell,
  Lock,
} from "lucide-react";

const PermissionCard = ({
  icon: Icon,
  title,
  description,
  active,
  onToggle,
}) => (
  <div
    onClick={onToggle}
    className={`p-8 border-2 transition-all duration-500 cursor-pointer flex flex-col justify-between h-64 ${
      active
        ? "border-slate-950 bg-white shadow-2xl shadow-slate-100"
        : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
    }`}>
    <div className="flex justify-between items-start">
      <div
        className={`p-3 ${active ? "bg-[#ff356c] text-white" : "bg-white text-slate-300 shadow-sm"}`}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div
        className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-[#ff356c]" : "text-slate-300"}`}>
        {active ? "Protocol Active" : "Disabled"}
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="text-xl font-bold tracking-tighter text-slate-950 uppercase">
        {title}
      </h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">
        {description}
      </p>
    </div>

    {/* Custom Slider */}
    <div className="w-full h-1 bg-slate-100 mt-4 relative">
      <div
        className={`absolute top-0 left-0 h-full bg-[#ff356c] transition-all duration-700 ${active ? "w-full" : "w-0"}`}
      />
    </div>
  </div>
);

const NotificationPermissions = () => {
  const navigate = useNavigate();
  const [mobileAuth, setMobileAuth] = useState(false);
  const [emailAuth, setEmailAuth] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      {/* 1. NAV BAR */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-950 transition-all">
          <ArrowLeft
            size={18}
            strokeWidth={1.5}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Settings
        </button>
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#ff356c]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
            Privacy Manifest
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* 2. HEADER */}
        <div className="mb-20 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-950 leading-none">
            Notification <br />{" "}
            <span className="italic font-serif text-[#ff356c]">Authority.</span>
          </h1>
          <p className="max-w-md text-[11px] uppercase tracking-[0.3em] font-bold text-slate-400 leading-loose">
            To maintain the purity of your experience, we require explicit
            authorization to bridge our updates to your personal devices.
          </p>
        </div>

        {/* 3. BENTO PERMISSION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <PermissionCard
            icon={Smartphone}
            title="Mobile HUD"
            description="Authorize real-time push signals for order movements, private drops, and concierge messaging."
            active={mobileAuth}
            onToggle={() => setMobileAuth(!mobileAuth)}
          />
          <PermissionCard
            icon={Mail}
            title="Digital Mail"
            description="Enable encrypted correspondence for digital receipts, lookbooks, and acquisition summaries."
            active={emailAuth}
            onToggle={() => setEmailAuth(!emailAuth)}
          />
        </div>

        {/* 4. SECURITY FOOTER & ACTION */}
        <div className="bg-slate-50 p-10 space-y-10">
          <div className="flex items-start gap-6">
            <ShieldCheck size={24} className="text-[#ff356c] shrink-0" />
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-950">
                Data Protocol
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Mnmukt respects your digital silence. We do not engage in spam.
                All authorized signals are encrypted and can be revoked at any
                moment through this manifest.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/user/profile")}
            className="w-full bg-slate-950 text-white py-6 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-[#ff356c] transition-all duration-500 shadow-2xl disabled:opacity-20"
            disabled={!mobileAuth && !emailAuth}>
            Confirm Digital Handshake
          </button>
        </div>

        {/* 5. BRANDING */}
        <div className="mt-20 flex flex-col items-center opacity-20">
          <div className="w-[1px] h-12 bg-slate-950 mb-6" />
          <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.8em]">
            MNMUKT
          </p>
        </div>
      </main>
    </div>
  );
};

export default NotificationPermissions;
