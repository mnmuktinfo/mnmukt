/**
 * SharedUI.jsx — Flipkart-style design tokens + atomic components
 * for the AdminMessages feature.
 */

import React from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const FK = {
  blue: "#2874F0",
  orange: "#FB641B",
  green: "#388E3C",
  red: "#FF6161",
  text: "#212121",
  sub: "#878787",
  bg: "#F1F3F6",
  white: "#FFFFFF",
  border: "#E0E0E0",
  blueBg: "#F4F8FF",
  shadow: "0 1px 4px rgba(0,0,0,0.10)",
  shadowMd: "0 2px 10px rgba(0,0,0,0.12)",
};

// ─── MESSAGE AVATAR ───────────────────────────────────────────────────────────
export const MsgAvatar = ({ name, size = "md" }) => {
  const ini = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";
  const palette = [
    "#2874F0",
    "#FB641B",
    "#388E3C",
    "#9C27B0",
    "#00796B",
    "#D32F2F",
    "#1565C0",
    "#4E342E",
  ];
  const color = palette[ini.charCodeAt(0) % palette.length];
  const sizes = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-black shrink-0 select-none`}
      style={{ background: color }}>
      {ini}
    </div>
  );
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    archived: { cls: "bg-gray-100 text-gray-500", label: "Archived" },
    active: { cls: "bg-green-100 text-green-700", label: "Active" },
    unread: {
      cls: "bg-[#F4F8FF] text-[#2874F0] border border-blue-200",
      label: "New",
    },
  };
  const s = map[status] ?? map.active;
  return (
    <span
      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${s.cls}`}>
      {s.label}
    </span>
  );
};

// ─── FK CHIP ─────────────────────────────────────────────────────────────────
export const Chip = ({ icon, label, color = "blue" }) => {
  const colors = {
    blue: "bg-[#F4F8FF] text-[#2874F0] border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    green: "bg-green-50 text-green-700 border-green-100",
  };
  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded border ${colors[color]}`}>
      {icon && <span className="opacity-70">{icon}</span>}
      {label}
    </div>
  );
};

// ─── ICON BUTTON ─────────────────────────────────────────────────────────────
export const IconBtn = ({
  icon,
  label,
  onClick,
  disabled,
  variant = "ghost",
}) => {
  const variants = {
    ghost: "text-[#878787] hover:text-[#212121] hover:bg-gray-100",
    danger: "text-[#878787] hover:text-[#FF6161] hover:bg-red-50",
    primary: "text-[#878787] hover:text-[#2874F0] hover:bg-[#F4F8FF]",
    archive: "text-[#878787] hover:text-amber-600 hover:bg-amber-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2 rounded transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]}`}>
      {icon}
    </button>
  );
};

// ─── SECTION DIVIDER ─────────────────────────────────────────────────────────
export const Divider = ({ label }) => (
  <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F8F9FA]">
    <span className="text-[9px] font-black text-[#BDBDBD] uppercase tracking-widest">
      {label}
    </span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

// ─── FK LOADER ────────────────────────────────────────────────────────────────
export const FKLoader = ({ label = "Loading…", mini = false }) =>
  mini ? (
    <div className="flex items-center gap-2 justify-center py-3">
      <div className="w-4 h-4 rounded-full border-2 border-[#E8F0FE] border-t-[#2874F0] animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest text-[#878787]">
        {label}
      </span>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-[#E8F0FE]" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#2874F0] animate-spin" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#878787]">
        {label}
      </p>
    </div>
  );

// ─── DATE FORMATTER ──────────────────────────────────────────────────────────
export const fmtDate = (raw) => {
  if (!raw) return "";
  try {
    const d = raw?.toDate ? raw.toDate() : new Date(raw);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800)
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
      });
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};
