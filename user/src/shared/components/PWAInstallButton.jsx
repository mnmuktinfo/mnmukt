import React, { useEffect, useState } from "react";
import {
  Download,
  X,
  ShieldCheck,
  Zap,
  Smartphone,
  Sparkles,
} from "lucide-react";

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  // Only show if the browser supports PWA install and the prompt is available
  if (!deferredPrompt || !showModal) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-[360px] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden relative animate-in slide-in-from-bottom-8 duration-700">
        {/* Minimalist Close Protocol */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-5 right-5 z-20 text-slate-300 hover:text-slate-950 transition-colors group">
          <X size={18} className="group-active:scale-90 transition-transform" />
        </button>

        {/* Brand Identity Header */}
        <div className="bg-white p-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            {/* Architectural Icon Box */}
            <div className="w-20 h-20 border border-slate-950 flex items-center justify-center relative bg-white group">
              <span className="text-slate-950 font-black text-3xl tracking-tighter transition-transform duration-700 group-hover:scale-110">
                M.
              </span>
              {/* Floating Status Indicator */}
              <div className="absolute -top-2 -right-2 bg-[#ff356c] w-5 h-5 rounded-full border-4 border-white animate-pulse" />
            </div>
            {/* Shadow beneath the box */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-900/5 blur-md" />
          </div>

          <div className="space-y-1">
            <h2 className="text-slate-950 text-xl font-bold tracking-tighter uppercase leading-none">
              Mnmukt{" "}
              <span className="italic font-serif text-[#ff356c]">Mobile.</span>
            </h2>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] pt-1">
              Universal Application
            </p>
          </div>
        </div>

        {/* Feature Manifest */}
        <div className="px-10 pb-10 space-y-8">
          <div className="space-y-5 py-6 border-y border-slate-50">
            <FeatureItem
              icon={<Zap size={14} className="text-[#ff356c]" />}
              label="Instant Access"
              desc="Optimized loading protocols"
            />
            <FeatureItem
              icon={<ShieldCheck size={14} className="text-slate-950" />}
              label="Secure Environment"
              desc="Encrypted device handshake"
            />
            <FeatureItem
              icon={<Sparkles size={14} className="text-[#ff356c]" />}
              label="Elite Experience"
              desc="Full-screen immersive interface"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleInstall}
              className="group relative overflow-hidden w-full bg-slate-950 text-white py-5 text-[10px] font-black uppercase tracking-[0.5em] transition-all duration-500 active:scale-[0.97]">
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-[#ff356c] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

              <div className="relative z-10 flex items-center justify-center gap-3">
                <Download
                  size={14}
                  strokeWidth={2.5}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
                Authorize Installation
              </div>
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 text-slate-300 text-[9px] font-bold uppercase tracking-[0.3em] hover:text-slate-950 transition-colors">
              Maybe Later
            </button>
          </div>
        </div>

        {/* Technical Footer HUD */}
        <div className="bg-slate-50/50 py-3 px-10 flex justify-center border-t border-slate-50">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
            Build v1.0.42 Stable Manifest
          </p>
        </div>
      </div>
    </div>
  );
};

// Refined Helper Component
const FeatureItem = ({ icon, label, desc }) => (
  <div className="flex gap-4 items-start">
    <div className="mt-0.5">{icon}</div>
    <div className="space-y-0.5">
      <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest leading-none">
        {label}
      </p>
      <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
        {desc}
      </p>
    </div>
  </div>
);

export default PWAInstallButton;
