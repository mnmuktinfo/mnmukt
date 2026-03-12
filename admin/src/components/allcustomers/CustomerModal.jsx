import React, { useState, useEffect } from "react";

export default function CustomerModal({ customer, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // When the modal opens or a new customer is selected, reset the form
  useEffect(() => {
    if (customer) {
      setFormData({
        displayName: customer.displayName || "",
        email: customer.email || "",
        phone: customer.phone || "",
      });
      setErrors({});
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  async function handleSave() {
    const newErrors = {};
    setErrors({});

    // Validation Rules
    if (!formData.displayName || formData.displayName.trim() === "") {
      newErrors.displayName = "Display name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const phoneDigits = (formData.phone || "").replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Pass validated data back to parent to save to Firebase
    setIsSaving(true);
    try {
      await onSave({ ...customer, ...formData });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Helper for shared input styling
  const getInputClasses = (hasError) => `
    block w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none
    ${isSaving ? "opacity-60 cursor-not-allowed bg-gray-100" : "bg-gray-50/50 hover:bg-gray-50 focus:bg-white"}
    ${
      hasError
        ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900 placeholder-red-300"
        : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-900 placeholder-gray-400"
    }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-all duration-300 ${isSaving ? "cursor-wait" : "cursor-default"}`}
        onClick={!isSaving ? onClose : undefined}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-gray-200/50 w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Edit Customer
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors disabled:opacity-50">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Display Name
            </label>
            <input
              value={formData.displayName}
              onChange={(e) => {
                setFormData({ ...formData, displayName: e.target.value });
                if (errors.displayName)
                  setErrors({ ...errors, displayName: null });
              }}
              disabled={isSaving}
              placeholder="e.g. Jane Doe"
              className={getInputClasses(errors.displayName)}
            />
            {errors.displayName && (
              <div className="flex items-center gap-1.5 mt-2 text-red-600 animate-in slide-in-from-top-1 fade-in duration-200">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-medium">{errors.displayName}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              disabled={isSaving}
              placeholder="jane@example.com"
              className={getInputClasses(errors.email)}
            />
            {errors.email && (
              <div className="flex items-center gap-1.5 mt-2 text-red-600 animate-in slide-in-from-top-1 fade-in duration-200">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-medium">{errors.email}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
              disabled={isSaving}
              placeholder="(555) 123-4567"
              className={getInputClasses(errors.phone)}
            />
            {errors.phone && (
              <div className="flex items-center gap-1.5 mt-2 text-red-600 animate-in slide-in-from-top-1 fade-in duration-200">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-medium">{errors.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200/50 disabled:opacity-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="relative inline-flex items-center justify-center min-w-[130px] px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 border border-transparent rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:opacity-80 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-100"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
