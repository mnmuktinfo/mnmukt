// src/components/form/AddressForm.jsx
import React from "react";
import { Loader2, CheckCircle2, AlertCircle, MapPin, Plus } from "lucide-react";
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
  disabled = false,
  pinLoading = false,
  pinStatus = "idle",
  onAddNewAddress,
}) => {
  const { user } = useAuth();

  const inputBase =
    "w-full px-3.5 py-3.5 text-[14px] rounded-none border border-gray-200 bg-[#f5f6f8] text-gray-900 placeholder:text-gray-500 transition-all duration-200 outline-none focus:border-blue-500 focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed";

  const getInput = (field) =>
    `${inputBase} ${
      errors[field]
        ? "border-red-400 focus:border-red-500 bg-red-50"
        : "hover:border-gray-300"
    }`;

  return (
    <div className="space-y-4 bg-white font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-[16px] font-semibold text-gray-900">
          Delivery Details
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 font-medium">
            Fast Checkout 🚀
          </span>

          {onAddNewAddress && (
            <button
              type="button"
              onClick={onAddNewAddress}
              disabled={disabled}
              className="flex items-center gap-1 text-[13px] px-3 py-1.5 border border-gray-200 text-blue-600 font-medium hover:bg-gray-50 transition disabled:opacity-50">
              <Plus size={14} />
              New
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-2">
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
              <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
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
              <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>
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
              <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div className="space-y-4">
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

              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {pinLoading || pinStatus === "loading" ? (
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                ) : (
                  <MapPin size={16} className="text-gray-400" />
                )}
              </div>
            </div>

            <div className="min-h-[18px] mt-1">
              {pinStatus === "valid" && (
                <span className="text-[11px] text-green-700 flex gap-1 items-center">
                  <CheckCircle2 size={12} />
                  Deliverable
                </span>
              )}

              {pinStatus === "invalid" && (
                <span className="text-[11px] text-red-600 flex gap-1 items-center">
                  <AlertCircle size={12} />
                  Not serviceable
                </span>
              )}

              {pinStatus === "idle" && (
                <span className="text-[11px] text-gray-500 italic">
                  Enter your delivery pincode
                </span>
              )}
            </div>
          </div>

          <input
            name="addressLine1"
            value={form.addressLine1 || ""}
            onChange={onChange}
            disabled={disabled}
            placeholder="Flat, house no, building *"
            autoComplete="address-line1"
            className={getInput("addressLine1")}
          />

          <input
            name="addressLine2"
            value={form.addressLine2 || ""}
            onChange={onChange}
            disabled={disabled}
            placeholder="Area, street, village *"
            autoComplete="address-line2"
            className={getInput("addressLine2")}
          />

          <input
            name="landmark"
            value={form.landmark || ""}
            onChange={onChange}
            disabled={disabled}
            placeholder="Landmark (optional)"
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
                <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>
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
                <p className="text-[11px] text-red-500 mt-1">
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
                <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>
              )}
            </div>
          </div>
        </div>

        {/* ADDRESS TYPE */}
        <div>
          <p className="text-[13px] font-bold mb-3">Address type</p>

          <div className="flex gap-5">
            {["Home", "Office", "Others"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tag"
                  value={type}
                  checked={form.tag === type}
                  onChange={onChange}
                  disabled={disabled}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SAVE TO PROFILE */}
        {user && (
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="saveToProfile"
              checked={form.saveToProfile || false}
              onChange={onChange}
              disabled={disabled}
            />

            <div>
              <p className="text-[13px] font-medium">Save to profile</p>

              <p className="text-[11px] text-gray-500">
                Faster checkout next time
              </p>
            </div>
          </label>
        )}

        {onAddNewAddress && (
          <button
            type="button"
            onClick={onAddNewAddress}
            disabled={disabled}
            className="w-full flex justify-center items-center gap-2 border border-dashed border-blue-200 py-2 text-blue-600 hover:bg-blue-50">
            <Plus size={13} />
            Use a different address instead
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressForm;
