import React from "react";
import {
  Plus,
  Edit2,
  X,
  CheckCircle2,
  Loader2,
  Star,
  Link as LinkIcon,
} from "lucide-react";

const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M35 65 L65 65 L50 35 Z' fill='%23d1d5db'/%3E%3Ccircle cx='35' cy='35' r='5' fill='%23d1d5db'/%3E%3C/svg%3E";

// Star display
const Stars = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={
          i < rating
            ? "text-[#FF9900] fill-[#FF9900]"
            : "text-gray-200 fill-gray-200"
        }
      />
    ))}
  </div>
);

// Interactive Star Picker
const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 w-fit">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="p-1 transition-transform active:scale-75 hover:scale-110">
        <Star
          size={28}
          className={
            value >= n
              ? "text-[#FF9900] fill-[#FF9900]"
              : "text-gray-300 fill-gray-200"
          }
        />
      </button>
    ))}
    <span className="ml-3 text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
      {value} / 5
    </span>
  </div>
);

const TestimonialModal = ({
  isOpen,
  formData,
  onChange,
  onSave,
  onCancel,
  saving,
  isEdit,
}) => {
  if (!isOpen) return null;
  const isValid = formData.name.trim() && formData.message.trim();

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${isEdit ? "bg-blue-100 text-[#2874F0]" : "bg-orange-100 text-[#FB641B]"}`}>
              {isEdit ? <Edit2 size={18} /> : <Plus size={18} />}
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit Review" : "Add New Customer Review"}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Customer Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:border-[#2874F0] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Customer Rating
              </label>
              <StarPicker
                value={formData.rating}
                onChange={(v) => onChange("rating", v)}
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Customer Photo Link{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                <img
                  src={formData.img || FALLBACK_SVG}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_SVG;
                  }}
                />
              </div>
              <div className="flex-1 relative">
                <LinkIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="url"
                  value={formData.img}
                  onChange={(e) => onChange("img", e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:border-[#2874F0] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Review Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => onChange("message", e.target.value)}
              placeholder="Customer review message"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:border-[#2874F0] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex flex-col-reverse sm:flex-row items-center gap-3 justify-end">
          {!isValid && (
            <span className="text-sm text-red-500 font-medium sm:mr-auto">
              Name and message required.
            </span>
          )}
          <button
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !isValid}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FB641B] text-white px-8 py-3 rounded-lg text-base font-bold hover:bg-[#f4511e] active:scale-95 transition-all disabled:opacity-50 shadow-md">
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            {isEdit ? "Update Review" : "Publish Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialModal;
