import React from "react";
import { X } from "lucide-react";
import { states } from "../../../config/state";

const AddressFormPopup = ({ isOpen, form, setForm, onSave, onCancel }) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  const inputClass =
    "w-full border border-gray-300 rounded-sm px-4 py-3 text-[13px] text-gray-800 outline-none focus:border-[#007673] transition-colors placeholder:text-gray-400";
  const labelClass =
    "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-100 flex items-end md:items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* MODAL */}
      <div
        className="
          relative
          w-full h-full md:h-auto
          md:max-w-xl
          bg-white
          md:rounded-t-3xl md:rounded-sm
          shadow-2xl
          overflow-y-auto
          p-6 pt-8 md:p-8
          animate-in slide-in-from-bottom-full md:zoom-in-95
          duration-300
          font-sans
          flex flex-col
        ">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-1.5">
          <X size={20} strokeWidth={2} />
        </button>

        {/* Modal Header */}
        <h2 className="text-[20px] font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
          {form?.id ? "Edit Address" : "Add New Address"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mobile Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={inputClass}
              />
            </div>
          </div>

          {/* Address Line 1 */}
          <div>
            <label className={labelClass}>
              Flat, House no., Building, Company *
            </label>
            <input
              type="text"
              name="addressLine1"
              required
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="e.g. Flat 4B, Taj Apartments"
              className={inputClass}
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className={labelClass}>Area, Street, Sector, Village</label>
            <input
              type="text"
              name="addressLine2"
              value={form.addressLine2 || ""}
              onChange={handleChange}
              placeholder="e.g. Linking Road, Bandra West"
              className={inputClass}
            />
          </div>

          {/* Pincode, City, State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                value={form.pincode}
                onChange={handleChange}
                placeholder="e.g. 400050"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Town / City *</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input
                list="state-list"
                name="state"
                required
                value={form.state}
                onChange={handleChange}
                placeholder="Select or type your state"
                className={inputClass}
              />
              <datalist id="state-list">
                {states.map((state) => (
                  <option key={state} value={state} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Action Buttons (mobile fixed) */}
          <div className="md:static fixed bottom-0 left-0 w-full flex items-center justify-end gap-3 p-6 bg-white border-t border-gray-100 z-50 ">
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-900 px-6 py-3.5 text-[12px] font-bold uppercase tracking-widest transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#007673] hover:bg-[#005f5c] text-white px-8 py-3.5 rounded-sm text-[12px] font-bold uppercase tracking-widest transition-colors shadow-sm">
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormPopup;
