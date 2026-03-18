import React, { useState } from "react";
import {
  X,
  MapPin,
  Phone,
  User,
  Building,
  Home,
  ChevronDown,
  Search,
} from "lucide-react";
import { states } from "../../../config/state";

const AddressFormPopup = ({ isOpen, form, setForm, onSave, onCancel }) => {
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (tag) => setForm((prev) => ({ ...prev, tag }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  const filteredStates = states.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  const inputClass =
    "w-full bg-white border border-gray-200 -lg px-3 py-2.5 pl-9 text-[13.5px] text-gray-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 placeholder:text-gray-400 transition-all";

  const labelClass =
    "block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-100 flex items-end md:items-center justify-center font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div className="relative w-full md:max-w-lg bg-white  shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1  bg-gray-200" />
        </div>

        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-[10.5px] font-semibold text-pink-500 uppercase tracking-widest mb-0.5">
              Delivery to
            </p>
            <h2 className="text-[16px] font-semibold text-gray-900">
              {form?.id ? "Edit address" : "Add new address"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="mt-0.5 p-1.5  bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-28">
          <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Contact section */}
            <Section title="Contact">
              <div className="space-y-3.5">
                <Field label="Full name">
                  <IconInput icon={<User size={14} />}>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className={inputClass}
                    />
                  </IconInput>
                </Field>

                <Field label="Mobile number">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200  text-[13px] text-gray-600 shrink-0">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <IconInput icon={<Phone size={14} />} className="flex-1">
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="10-digit number"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className={inputClass}
                      />
                    </IconInput>
                  </div>
                </Field>
              </div>
            </Section>

            {/* Address section */}
            <Section title="Address">
              <div className="space-y-3.5">
                <Field label="Pincode">
                  <IconInput icon={<MapPin size={14} />}>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 400050"
                      maxLength={6}
                      className={inputClass}
                    />
                  </IconInput>
                </Field>

                <Field label="House / flat / building, street, area">
                  <textarea
                    name="addressLine1"
                    required
                    rows={2}
                    value={form.addressLine1}
                    onChange={handleChange}
                    placeholder="e.g. Flat 4B, Taj Apartments, Linking Road"
                    className="w-full bg-white border border-gray-200 -lg px-3 py-2.5 text-[13.5px] text-gray-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 placeholder:text-gray-400 resize-none transition-all"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="City / district">
                    <input
                      type="text"
                      name="city"
                      required
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full bg-white border border-gray-200 -lg px-3 py-2.5 text-[13.5px] text-gray-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 placeholder:text-gray-400 transition-all"
                    />
                  </Field>

                  <Field label="State">
                    <button
                      type="button"
                      onClick={() => setIsStateModalOpen(true)}
                      className="w-full flex items-center justify-between bg-white border border-gray-200 -lg px-3 py-2.5 text-[13.5px] text-left outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition-all">
                      <span
                        className={
                          form.state ? "text-gray-900" : "text-gray-400"
                        }>
                        {form.state || "Select"}
                      </span>
                      <ChevronDown
                        size={14}
                        className="text-gray-400 shrink-0"
                      />
                    </button>
                  </Field>
                </div>
              </div>
            </Section>

            {/* Save as */}
            <Section title="Save as">
              <div className="flex gap-2.5">
                <TagButton
                  active={!form.tag || form.tag === "HOME"}
                  icon={<Home size={13} />}
                  label="Home"
                  onClick={() => handleTagChange("HOME")}
                />
                <TagButton
                  active={form.tag === "WORK"}
                  icon={<Building size={13} />}
                  label="Work"
                  onClick={() => handleTagChange("WORK")}
                />
              </div>
            </Section>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-safe flex gap-3 items-center shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.06)]">
          <button
            type="button"
            onClick={onCancel}
            className="hidden md:block px-5 py-3 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="address-form"
            className="flex-1 md:flex-none md:px-10 py-3 bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white -xl text-[14px] font-semibold tracking-wide transition-all shadow-sm shadow-pink-200">
            Save address
          </button>
        </div>
      </div>

      {/* State modal */}
      {isStateModalOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col justify-end md:items-center md:justify-center bg-black/50">
          <div className="bg-white w-full md:max-w-sm md:-2xl flex flex-col max-h-[75vh] overflow-hidden shadow-2xl">
            {/* Modal drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-9 h-1  bg-gray-200" />
            </div>

            <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-gray-900">
                Select state
              </h3>
              <button
                onClick={() => {
                  setIsStateModalOpen(false);
                  setStateSearch("");
                }}
                className="p-1.5  bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="shrink-0 px-4 pt-3 pb-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search state…"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 -lg pl-9 pr-3 py-2.5 text-[13.5px] text-gray-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-gray-100 px-2 pb-4">
              {filteredStates.length === 0 ? (
                <p className="text-[13px] text-gray-400 py-4 px-3">
                  No states found.
                </p>
              ) : (
                filteredStates.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, state }));
                      setIsStateModalOpen(false);
                      setStateSearch("");
                    }}
                    className="w-full text-left px-3 py-3 text-[13.5px] text-gray-700 hover:bg-pink-50 hover:text-pink-600 -lg transition-colors">
                    {state}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Small helper components ──────────────────────────────

const Section = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-100  overflow-hidden">
    <div className="px-4 py-2.5 border-b border-gray-100">
      <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest">
        {title}
      </span>
    </div>
    <div className="px-4 py-4">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const IconInput = ({ icon, children, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      {icon}
    </div>
    {children}
  </div>
);

const TagButton = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2  border text-[12.5px] font-medium transition-all ${
      active
        ? "border-pink-500 bg-pink-50 text-pink-600"
        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
    }`}>
    {icon}
    {label}
  </button>
);

export default AddressFormPopup;
