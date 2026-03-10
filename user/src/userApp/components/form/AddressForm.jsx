import React from "react";
import { ChevronLeft } from "lucide-react";

const AddressForm = ({ form, setForm, onSave, onCancel }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // DARKER protocol: slate-950 for text, slate-300 for placeholders
  const inputClass =
    "w-full bg-transparent border-b-2 border-slate-100 py-4 outline-none focus:border-[#ff356c] text-lg font-medium text-slate-950 transition-all placeholder:text-slate-200";

  const labelClass =
    "block text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-2 group-focus-within:text-[#ff356c] transition-colors";

  return (
    <div className="fixed inset-0 bg-white z-[150] flex flex-col font-sans">
      {/* 1. FULL PAGE HEADER (Mobile Optimized) */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-slate-50">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 group transition-colors">
          <ChevronLeft
            size={20}
            className="text-slate-900 group-hover:text-[#ff356c]"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
            Back
          </span>
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">
          Shipping Protocol
        </h1>
        <div className="w-10" /> {/* Symmetry Spacer */}
      </div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pt-12 pb-32">
        <div className="max-w-2xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-950 leading-none">
              Delivery{" "}
              <span className="italic font-serif text-[#ff356c]">
                Identity.
              </span>
            </h2>
            <p className="mt-4 text-[11px] uppercase tracking-[0.3em] font-bold text-slate-400">
              Provide your precise logistics coordinates.
            </p>
          </div>

          <form className="space-y-12">
            {/* Row 1: Identity & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="group">
                <label className={labelClass}>Full Identity</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Legal Full Name"
                  className={inputClass}
                />
              </div>

              <div className="group">
                <label className={labelClass}>Contact Line</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 —"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Row 2: Building */}
            <div className="group">
              <label className={labelClass}>Residence / Building</label>
              <input
                type="text"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="Suite, House No, Landmark"
                className={inputClass}
              />
            </div>

            {/* Row 3: Locality */}
            <div className="group">
              <label className={labelClass}>Street Essence</label>
              <input
                type="text"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Area, Sector, or Locality"
                className={inputClass}
              />
            </div>

            {/* Row 4: Geography */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group">
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="group">
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="group">
                <label className={labelClass}>PIN Code</label>
                <input
                  type="number"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 3. STICKY ACTION BAR */}
      <div className="p-8 border-t border-slate-50 bg-white sticky bottom-0">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
          <button
            onClick={onSave}
            className="flex-1 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.5em] py-6 hover:bg-[#ff356c] transition-all duration-500 shadow-2xl">
            Authorize Address
          </button>
          <button
            onClick={onCancel}
            className="md:w-40 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] py-6 hover:text-slate-950 transition-colors border border-transparent hover:border-slate-100">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
