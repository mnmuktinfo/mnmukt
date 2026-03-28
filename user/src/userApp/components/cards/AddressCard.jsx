import React from "react";
import {
  MapPin,
  Phone,
  Pencil,
  Home,
  Briefcase,
  Star,
  Plus,
} from "lucide-react";

/* ── Tag icon mapping ── */
const TAG_ICONS = {
  home: <Home size={16} color="#df0059" strokeWidth={2} />,
  work: <Briefcase size={16} color="#df0059" strokeWidth={2} />,
  other: <Star size={16} color="#df0059" strokeWidth={2} />,
};

const tagIcon = (tag) =>
  TAG_ICONS[tag?.toLowerCase()] ?? (
    <MapPin size={16} color="#df0059" strokeWidth={2} />
  );

/* ── AddressCard Component ── */
const AddressCard = ({ address, userName, userPhone, onEdit, onAdd }) => {
  // ── Empty state ──
  if (
    !address ||
    (!address.line1 &&
      !address.addressLine1 &&
      !address.city &&
      !address.pincode)
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl text-center transition-colors hover:border-zinc-300 hover:bg-zinc-100">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
          <MapPin size={24} className="text-zinc-300" strokeWidth={1.8} />
        </div>
        <div>
          <p
            className="text-lg text-zinc-800"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            No address saved
          </p>
          <p className="text-sm text-zinc-400 max-w-[220px] leading-snug mt-1">
            Add a delivery location to speed up your checkout.
          </p>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="mt-2 flex items-center gap-1.5 px-5 py-2.5 bg-[#df0059] hover:bg-[#c4004e] text-white text-[13px] font-semibold rounded-lg transition-all shadow-[0_4px_12px_rgba(223,0,89,0.25)] hover:shadow-[0_6px_16px_rgba(223,0,89,0.35)] hover:-translate-y-0.5 active:translate-y-0">
            <Plus size={15} strokeWidth={2.5} /> Add Address
          </button>
        )}
      </div>
    );
  }

  // ── Normalize fields ──
  const line1 = address.line1 || address.addressLine1 || "";
  const city = address.city || "";
  const state = address.state || "";
  const pincode = address.pincode || "";
  const tag = address.tag || "";
  const name = address.name || userName || "";
  const phone = address.phone || userPhone || "";
  const hasLocation = city || state || pincode;

  return (
    <div className="flex flex-col  overflow-hidden transition-all duration-300 animate-[fadeUp_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-dashed border-zinc-200 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          {/* Tag icon */}
          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
            {tagIcon(tag)}
          </div>
          <div className="min-w-0">
            <p
              className="text-[22px] leading-tight text-zinc-900 truncate"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              {name || "Address Details"}
            </p>
            {tag && (
              <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-100 border border-zinc-200 text-zinc-500">
                {tag}
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            aria-label={`Edit address${name ? " for " + name : ""}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-transparent text-zinc-400 text-xs font-semibold shrink-0 transition-all hover:bg-pink-50 hover:border-pink-200 hover:text-[#df0059] active:translate-y-px">
            <Pencil size={13} strokeWidth={2} /> Edit
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-4 grow">
        {line1 && (
          <p className="text-[15px] text-zinc-800 leading-relaxed">{line1}</p>
        )}
        {hasLocation && (
          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            <span className="text-sm text-zinc-400">
              {[city, state].filter(Boolean).join(", ")}
            </span>
            {pincode && (
              <span className="text-xs font-semibold tracking-wide text-zinc-600 bg-zinc-100 border border-zinc-200 rounded-md px-2 py-0.5">
                {pincode}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Footer / Phone ── */}
      {phone && (
        <div className="flex items-center gap-3 px-5 py-3.5 border-t border-zinc-100 bg-zinc-50">
          <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
            <Phone size={13} className="text-zinc-400" strokeWidth={2} />
          </div>
          <p className="text-sm text-zinc-400">
            <span className="text-zinc-700 font-medium">{phone}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
