import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  Globe,
  Info,
  ChevronLeft,
  Smartphone,
  FileText,
  Scale,
  Lock,
  Truck,
  RotateCcw,
} from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();

  const settingSections = [
    {
      title: "App Preferences",
      items: [
        {
          label: "Interface Language",
          icon: Globe,
          value: "English",
          path: "/settings/language",
        },
        {
          label: "System Version",
          icon: Smartphone,
          value: "v2.4.0",
          path: null,
        },
      ],
    },
    {
      title: "Legal Protocols",
      items: [
        { label: "Privacy Policy", icon: Lock, path: "/privacy-policy" },
        { label: "Service Terms", icon: FileText, path: "/terms-conditions" },
        { label: "Logistics Policy", icon: Truck, path: "/shipping-policy" },
        { label: "Return Manifest", icon: RotateCcw, path: "/return-policy" },
        { label: "Cookie Security", icon: ShieldCheck, path: "/cookie-policy" },
      ],
    },
    {
      title: "The House of Mnmukt",
      items: [
        { label: "About Our Essence", icon: Info, path: "/about-us" },
        { label: "Regulatory Compliance", icon: Scale, path: "/compliance" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      {/* 1. MINIMALIST NAVIGATION */}
      <div className="bg-white border-b border-slate-50 sticky top-0 z-50 px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 group transition-colors">
          <ChevronLeft
            size={18}
            className="text-slate-400 group-hover:text-[#ff356c]"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900">
            Back
          </span>
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900 pr-8">
          System
        </h1>
        <div className="w-4" /> {/* Spacer for symmetry */}
      </div>

      <main className="max-w-2xl mx-auto px-6">
        {/* 2. REFINED SECTIONS */}
        {settingSections.map((section, idx) => (
          <div key={idx} className="mt-16">
            <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-6">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  disabled={!item.path}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center justify-between py-5 border-b border-slate-50 transition-all group ${
                    item.path ? "hover:border-[#ff356c]/20" : "cursor-default"
                  }`}>
                  <div className="flex items-center gap-6">
                    <item.icon
                      size={18}
                      className={`transition-colors ${
                        item.path
                          ? "text-slate-300 group-hover:text-[#ff356c]"
                          : "text-slate-200"
                      }`}
                      strokeWidth={1.2}
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-950 transition-colors">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {item.value && (
                      <span className="text-[10px] uppercase tracking-widest font-black text-slate-300">
                        {item.value}
                      </span>
                    )}
                    {item.path && (
                      <ChevronRight
                        size={14}
                        className="text-slate-200 group-hover:translate-x-1 transition-transform"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* 3. MNMUKT BRANDING FOOTER */}
        <div className="mt-24 mb-12 flex flex-col items-center">
          <div className="w-[1px] h-12 bg-slate-100 mb-8" />
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.6em]">
            MNMUKT
          </p>
          <p className="text-[8px] text-slate-300 mt-3 uppercase tracking-[0.2em] italic font-serif">
            The Purity of Design
          </p>
          <p className="text-[7px] text-slate-200 mt-6 tracking-[0.1em]">
            Authorized Version 2.4.0
          </p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
