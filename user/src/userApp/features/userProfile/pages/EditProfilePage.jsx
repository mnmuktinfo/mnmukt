import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/UserContext";
import { updateProfileData } from "../../auth/services/authService";

import {
  ArrowLeftIcon,
  CameraIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

/* ─── Zara-Style + Accent Components ─── */

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1 w-full relative group">
    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#da127d] transition-colors">
      {label}
    </label>
    <input
      {...props}
      className="border-b border-gray-200 focus:border-[#da127d] transition-colors py-3 text-[13px] text-black outline-none bg-transparent placeholder-gray-300 w-full rounded-none"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1 w-full relative group">
    <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#da127d] transition-colors">
      {label}
    </label>
    <select
      {...props}
      className="border-b border-gray-200 focus:border-[#da127d] transition-colors py-3 text-[13px] text-black outline-none bg-transparent w-full rounded-none cursor-pointer appearance-none">
      {children}
    </select>
    {/* Custom Dropdown Arrow to match thin stroke style */}
    <div className="absolute right-0 bottom-4 pointer-events-none text-gray-400 group-focus-within:text-[#da127d]">
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-5 border-b border-gray-200 group">
    <span className="text-[12px] uppercase tracking-widest text-black">
      {label}
    </span>
    <button
      type="button"
      onClick={() => onChange({ target: { checked: !checked } })}
      className={`w-10 h-[22px] flex items-center rounded-full transition-colors duration-300 focus:outline-none ${
        checked ? "bg-[#da127d]" : "bg-gray-200"
      }`}>
      <span
        className={`w-[18px] h-[18px] bg-white rounded-full transform transition-transform duration-300 shadow-sm ${
          checked ? "translate-x-5" : "translate-x-[2px]"
        }`}
      />
    </button>
  </div>
);

/* ─── MAIN PAGE ─── */

const EditProfilePage = () => {
  const { user, address, updateUserAndSync, saveAddress } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    avatarUrl: "",
    notificationsEnabled: true,
    marketingEmails: false,
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        name: user.name ?? "",
        phone: user.phone ?? "",
        gender: user.gender ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        avatarUrl: user.avatarUrl ?? "",
        notificationsEnabled: user.notificationsEnabled ?? true,
        marketingEmails: user.marketingEmails ?? false,
      }));
    }
    if (address) {
      setForm((p) => ({
        ...p,
        addressLine1: address.line1 ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        pincode: address.pincode ?? "",
      }));
    }
  }, [user, address]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const setCheck = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalAddressId = user.defaultAddressId;

      if (form.addressLine1 || form.city) {
        const saved = await saveAddress({
          line1: form.addressLine1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          id: address?.id ?? null,
        });
        finalAddressId = saved.id;
      }

      const updates = {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        avatarUrl: form.avatarUrl,
        notificationsEnabled: form.notificationsEnabled,
        marketingEmails: form.marketingEmails,
        defaultAddressId: finalAddressId,
      };

      await updateProfileData(user.uid, updates);
      await updateUserAndSync(updates);

      navigate("/user/profile");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const avatar =
    form.avatarUrl ||
    `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=f3f4f6&color=000000`;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#da127d] selection:text-white pb-20">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={() => navigate("/user/profile")}
          className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-gray-500 hover:text-[#da127d] transition-colors">
          <ArrowLeftIcon className="w-4 h-4 stroke-1" />
          Back
        </button>
        <span className="text-[12px] tracking-[0.25em] text-black absolute left-1/2 -translate-x-1/2">
          EDIT PROFILE
        </span>
        <div className="w-10" /> {/* Spacer for flex balancing */}
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 py-10">
        {/* ── AVATAR SECTION (Centered at Top) ── */}
        <div className="flex flex-col items-center gap-4 mb-14 pb-12 border-b border-gray-200">
          <div className="relative group cursor-pointer">
            {/* Inner border to look like an editorial crop */}
            <div className="w-24 h-24 rounded-full border border-gray-200 p-1 transition-colors duration-300 group-hover:border-[#da127d]">
              <img
                src={avatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-gray-50"
              />
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white border border-gray-200 text-black p-1.5 rounded-full shadow-sm group-hover:text-[#da127d] group-hover:border-[#da127d] transition-all">
              <CameraIcon className="w-4 h-4 stroke-1" />
            </button>
          </div>
          <div className="text-[12px] tracking-widest text-gray-400 uppercase">
            {user?.email}
          </div>
        </div>

        {/* ── FORM GRID ── */}
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* LEFT COLUMN: Personal Details */}
          <div className="space-y-8">
            <h2 className="text-[11px] text-gray-400 tracking-[0.2em] border-b border-black pb-4">
              PERSONAL DETAILS
            </h2>
            <div className="space-y-6">
              <Input
                label="Full Name"
                value={form.name}
                onChange={set("name")}
                placeholder="JANE DOE"
              />
              <Input
                label="Phone Number"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 XXXXX XXXXX"
              />

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={set("dateOfBirth")}
                />
                <Select
                  label="Gender"
                  value={form.gender}
                  onChange={set("gender")}>
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Address & Preferences */}
          <div className="space-y-8">
            <h2 className="text-[11px] text-gray-400 tracking-[0.2em] border-b border-black pb-4">
              DELIVERY & PREFERENCES
            </h2>

            <div className="space-y-6">
              <Input
                label="Street Address / Area"
                value={form.addressLine1}
                onChange={set("addressLine1")}
                placeholder="123 FASHION STREET"
              />

              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="City"
                  value={form.city}
                  onChange={set("city")}
                  placeholder="MUMBAI"
                />
                <Input
                  label="State"
                  value={form.state}
                  onChange={set("state")}
                  placeholder="MAHARASHTRA"
                />
              </div>

              <Input
                label="Pincode"
                value={form.pincode}
                onChange={set("pincode")}
                placeholder="400001"
              />
            </div>

            <div className="pt-8">
              <h3 className="text-[10px] text-gray-400 tracking-[0.2em] mb-2">
                NOTIFICATIONS
              </h3>
              <Toggle
                label="Push Notifications"
                checked={form.notificationsEnabled}
                onChange={setCheck("notificationsEnabled")}
              />
              <Toggle
                label="Marketing Emails"
                checked={form.marketingEmails}
                onChange={setCheck("marketingEmails")}
              />
            </div>
          </div>
        </div>

        {/* ── SUBMIT BUTTON ── */}
        <div className="mt-16 flex justify-center border-t border-gray-200 pt-10">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-[400px] bg-black text-white py-4 text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-[#da127d] transition-colors shadow-lg shadow-transparent hover:shadow-[#da127d]/20 disabled:opacity-50 disabled:hover:bg-black">
            {loading ? (
              <span className="animate-pulse">SAVING CHANGES...</span>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 stroke-[1.5]" />
                SAVE PROFILE
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
