import React from "react";

const AddressCard = ({ address, onEdit }) => {
  if (!address) return null;

  return (
    <div className="relative bg-white font-sans">
      {/* 1. TOP HEADER (Status & Action) */}
      <div className="flex items-center justify-between mb-6">
        {/* Minimalist HUD Badge */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff356c]" />
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">
            Primary Location
          </span>
        </div>

        {/* Change / Edit Button */}
        <button
          onClick={onEdit}
          className="text-[10px] font-black text-slate-400 hover:text-[#ff356c] uppercase tracking-widest transition-colors">
          Modify
        </button>
      </div>

      {/* 2. IDENTITY (Bold Onyx) */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold tracking-tighter text-slate-950 leading-none">
          {address.name}{" "}
          <span className="italic font-serif text-[#ff356c] opacity-50">.</span>
        </h4>

        {/* 3. COORDINATES (Darkened & Weighted) */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800 leading-relaxed">
            {address.addressLine1}
            {address.addressLine2 && (
              <span className="text-slate-400">, {address.addressLine2}</span>
            )}
          </p>

          <p className="text-sm font-medium text-slate-800">
            {address.city}, {address.state} — {address.pincode}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Contact
            </span>
            <p className="text-sm font-bold text-slate-950">{address.phone}</p>
          </div>
        </div>
      </div>

      {/* 4. LOGISTICS FOOTNOTE (Minimal HUD) */}
      <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
            Delivery Window
          </p>
          <p className="text-[11px] font-bold text-slate-900">48 — 72 Hours</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
            Protocol
          </p>
          <p className="text-[11px] font-bold text-slate-900 italic font-serif">
            COD Authorized
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
