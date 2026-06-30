import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { useAuth } from "../../features/auth/context/UserContext";

const AddressForm = ({
  form = {},
  errors = {},
  onChange,
  disabled = false,
}) => {
  const { user, setSavedAddress } = useAuth();

  const [pinLoading, setPinLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState(null);

  // ================= INPUT SYNC =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if ((name === "phone" || name === "postalCode") && !/^\d*$/.test(value))
      return;

    if (name === "phone" && value.length > 10) return;
    if (name === "postalCode" && value.length > 6) return;

    onChange?.(e);

    if (name === "postalCode" && value.length === 6) {
      fetchPin(value);
    } else if (name === "postalCode" && value.length < 6) {
      setPinStatus(null);
    }
  };

  // ================= PIN API =================
  const fetchPin = async (pin) => {
    if (!/^[1-9][0-9]{5}$/.test(pin)) return;

    setPinLoading(true);
    setPinStatus(null);

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const result = data?.[0];

      if (result?.Status === "Success") {
        const office = result.PostOffice?.[0];

        onChange?.({
          target: { name: "city", value: office?.District || "" },
        });
        onChange?.({
          target: { name: "state", value: office?.State || "" },
        });

        setPinStatus("valid");
      } else {
        setPinStatus("invalid");
      }
    } catch {
      setPinStatus("invalid");
    }

    setPinLoading(false);
  };

  // ================= SAVE ADDRESS =================
  useEffect(() => {
    if (form.saveToProfile && setSavedAddress) {
      const { saveToProfile, ...clean } = form;
      setSavedAddress(clean);
    }
  }, [form.saveToProfile, form, setSavedAddress]);

  // ================= STYLES =================
  const inputBase =
    "w-full px-3.5 py-3 text-[14px] rounded-lg border " +
    "bg-white text-gray-900 placeholder:text-gray-400 " +
    "transition-all duration-200 outline-none " +
    "focus:border-black focus:ring-2 focus:ring-pink-100 " +
    "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const getInput = (field) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 hover:border-gray-300"
    }`;

  // ================= UI =================
  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-gray-900">
          Delivery Details
        </h3>

        <span className="text-[11px] bg-pink-50 text-pink-600 px-3 py-1 rounded-full">
          Fast Checkout 🚀
        </span>
      </div>

      {/* CONTACT CARD */}
      <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-3">
        <h4 className="text-[13px] font-semibold text-gray-800">
          Contact Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="email"
            name="email"
            value={form.email || user?.email || ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Email address"
            className={`${getInput("email")} md:col-span-2`}
          />

          <input
            name="fullName"
            value={form.fullName || user?.name || ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Full name"
            className={getInput("fullName")}
          />

          <input
            name="phone"
            value={form.phone || user?.phone || ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Mobile number"
            className={getInput("phone")}
          />
        </div>
      </div>

      {/* ADDRESS CARD */}
      <div className="p-4 rounded-xl border border-gray-100 bg-white space-y-3">
        <h4 className="text-[13px] font-semibold text-gray-800">
          Shipping Address
        </h4>

        {/* PIN */}
        <div className="relative">
          <input
            name="postalCode"
            value={form.postalCode || ""}
            onChange={handleChange}
            disabled={disabled}
            placeholder="PIN code"
            className={getInput("postalCode")}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {pinLoading ? (
              <Loader2 className="animate-spin text-gray-500" size={16} />
            ) : (
              <MapPin className="text-gray-400" size={16} />
            )}
          </div>
        </div>

        {/* PIN STATUS */}
        <div className="min-h-[18px]">
          {pinStatus === "valid" && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
              <CheckCircle2 size={12} /> Deliverable
            </span>
          )}

          {pinStatus === "invalid" && (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
              <AlertCircle size={12} /> Not serviceable
            </span>
          )}

          {!pinStatus && (
            <span className="text-xs text-gray-400">
              Enter PIN to auto-fill city & state
            </span>
          )}
        </div>

        {/* ADDRESS */}
        <input
          name="addressLine1"
          value={form.addressLine1 || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Flat / House / Building"
          className={getInput("addressLine1")}
        />

        <input
          name="addressLine2"
          value={form.addressLine2 || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Area / Street / Landmark"
          className={getInput("addressLine2")}
        />

        {/* CITY / STATE */}
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.city || ""}
            readOnly
            placeholder="City"
            className="px-3.5 py-3 text-[14px] rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
          />

          <input
            value={form.state || ""}
            readOnly
            placeholder="State"
            className="px-3.5 py-3 text-[14px] rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
          />
        </div>
      </div>

      {/* ADDRESS TYPE */}
      <div className="p-4 rounded-xl border border-gray-100 bg-white">
        <p className="text-[13px] font-medium mb-2 text-gray-700">Save as</p>

        <div className="flex gap-2">
          {["Home", "Office", "Others"].map((type) => (
            <label key={type} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="addressType"
                value={type}
                checked={form.addressType === type}
                onChange={handleChange}
                className="hidden peer"
              />

              <div className="text-center py-2 rounded-lg text-[13px] border border-gray-200 text-gray-600 peer-checked:bg-black peer-checked:text-white peer-checked:border-black transition">
                {type}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* SAVE TO PROFILE */}
      {user && (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="saveToProfile"
            checked={form.saveToProfile || false}
            onChange={handleChange}
            className="mt-1 accent-pink-500"
          />

          <div>
            <p className="text-[14px] font-medium text-gray-900">
              Save to profile
            </p>
            <p className="text-[12px] text-gray-500">
              Faster checkout next time 🚀
            </p>
          </div>
        </label>
      )}
    </div>
  );
};

export default AddressForm;
