// src/components/form/AddressForm.jsx
import React from "react";
import { Loader2, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { useAuth } from "../../features/auth/context/UserContext";

/**
 * @typedef {Object} AddressFormData
 * @property {string} [email]
 * @property {string} [fullName]
 * @property {string} [phone]
 * @property {string} [postalCode]
 * @property {string} [addressLine1]
 * @property {string} [addressLine2]
 * @property {string} [landmark]
 * @property {string} [city]
 * @property {string} [district]
 * @property {string} [state]
 * @property {"Home" | "Office" | "Others" | string} [tag]
 * @property {boolean} [saveToProfile]
 */

/**
 * @param {Object} props
 */
const AddressForm = ({
  form = {},
  errors = {},
  onChange,
  onSubmit,
  disabled = false,
  pinLoading = false,
  pinStatus = "idle",
  onAddNewAddress,
}) => {
  const { user } = useAuth();

  const inputBase =
    "w-full px-4 py-3.5 text-[13px] rounded-sm border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

  const getInput = (field) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/50"
        : "hover:border-gray-300"
    }`;

  return (
    <div className="flex flex-col h-full bg-white font-sans text-gray-900">
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-[15px] font-medium text-gray-900">
            Contact & Delivery
          </h3>
        </div>

        <div className="space-y-4 pt-1 pb-6">
          {/* CONTACT INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={onChange}
                disabled={disabled}
                placeholder="E-mail *"
                autoComplete="email"
                className={getInput("email")}
              />
              {errors.email && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <input
                name="fullName"
                value={form.fullName || ""}
                onChange={onChange}
                disabled={disabled}
                placeholder="Full name *"
                autoComplete="name"
                className={getInput("fullName")}
              />
              {errors.fullName && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <input
                name="phone"
                value={form.phone || ""}
                onChange={onChange}
                disabled={disabled}
                placeholder="Mobile number *"
                inputMode="numeric"
                autoComplete="tel"
                className={getInput("phone")}
              />
              {errors.phone && (
                <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* ADDRESS SECTION */}
          <div className="space-y-4 pt-2">
            {/* PINCODE */}
            <div>
              <div className="relative">
                <input
                  name="postalCode"
                  value={form.postalCode || ""}
                  onChange={onChange}
                  disabled={disabled}
                  placeholder="Pincode *"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  className={getInput("postalCode")}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {pinLoading || pinStatus === "loading" ? (
                    <Loader2 size={16} className="animate-spin text-pink-500" />
                  ) : (
                    <MapPin size={16} className="text-gray-400" />
                  )}
                </div>
              </div>

              <div className="min-h-[20px] mt-1.5">
                {pinStatus === "valid" && (
                  <span className="text-[11px] text-green-600 font-medium flex gap-1 items-center">
                    <CheckCircle2 size={14} />
                    Deliverable to this PIN
                  </span>
                )}

                {pinStatus === "invalid" && (
                  <span className="text-[11px] text-red-600 font-medium flex gap-1 items-center">
                    <AlertCircle size={14} />
                    Not serviceable
                  </span>
                )}

                {pinStatus === "idle" && (
                  <span className="text-[11px] text-gray-400 italic">
                    Enter your delivery pincode to check availability
                  </span>
                )}
              </div>
            </div>

            <input
              name="addressLine1"
              value={form.addressLine1 || ""}
              onChange={onChange}
              disabled={disabled}
              placeholder="Flat, house no, building, company *"
              autoComplete="address-line1"
              className={getInput("addressLine1")}
            />

            <input
              name="addressLine2"
              value={form.addressLine2 || ""}
              onChange={onChange}
              disabled={disabled}
              placeholder="Area, street, sector, village *"
              autoComplete="address-line2"
              className={getInput("addressLine2")}
            />

            <input
              name="landmark"
              value={form.landmark || ""}
              onChange={onChange}
              disabled={disabled}
              placeholder="Landmark (e.g. near Apollo Hospital)"
              className={getInput("landmark")}
            />

            {/* CITY / DISTRICT / STATE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  name="city"
                  value={form.city || ""}
                  onChange={onChange}
                  disabled={disabled}
                  placeholder="City *"
                  autoComplete="address-level2"
                  className={getInput("city")}
                />
                {errors.city && (
                  <p className="text-[11px] text-red-500 mt-1.5">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="district"
                  value={form.district || ""}
                  onChange={onChange}
                  disabled={disabled}
                  placeholder="District *"
                  className={getInput("district")}
                />
                {errors.district && (
                  <p className="text-[11px] text-red-500 mt-1.5">
                    {errors.district}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="state"
                  value={form.state || ""}
                  onChange={onChange}
                  disabled={disabled}
                  placeholder="State *"
                  autoComplete="address-level1"
                  className={getInput("state")}
                />
                {errors.state && (
                  <p className="text-[11px] text-red-500 mt-1.5">
                    {errors.state}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ADDRESS TYPE */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              Address Type
            </p>

            <div className="flex gap-6">
              {["Home", "Office", "Others"].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="tag"
                    value={type}
                    checked={form.tag === type}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500 accent-pink-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-gray-700 group-hover:text-gray-900 transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* SAVE TO PROFILE */}
          {user && (
            <div className="pt-4 mt-2 border-t border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="saveToProfile"
                  checked={form.saveToProfile || false}
                  onChange={onChange}
                  disabled={disabled}
                  className="mt-0.5 w-4 h-4 text-pink-500 border-gray-300 rounded-sm focus:ring-pink-500 accent-pink-500 cursor-pointer"
                />
                <div>
                  <p className="text-[13px] font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                    Save to profile
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Save this address for a faster checkout next time.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* FIXED BOTTOM CTA within Flex Container */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 z-50">
        <button
          type="button"
          onClick={onSubmit}
          disabled={
            disabled || pinStatus === "loading" || pinStatus === "invalid"
          }
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3.5 px-4 rounded-sm transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
          {disabled || pinLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            "Save Address"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddressForm;
