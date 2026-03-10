import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Star,
  MessageCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  UserCheck,
  Link as LinkIcon,
} from "lucide-react";
import { useTestimonials } from "../hooks/useTestimonials";

// ─── Constants & Helpers ──────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", img: "", message: "", rating: 5 };

const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M35 65 L65 65 L50 35 Z' fill='%23d1d5db'/%3E%3Ccircle cx='35' cy='35' r='5' fill='%23d1d5db'/%3E%3C/svg%3E";

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// Stat card
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900 leading-none mb-1">
        {value}
      </p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

// Full Screen / Modal Form
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="e.g. Ayesha Khan"
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

          {/* Simple Photo URL Input with Preview */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Customer Photo Link{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              {/* Live Preview Circle */}
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

              {/* URL Input Box */}
              <div className="flex-1 relative">
                <LinkIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="url"
                  value={formData.img}
                  onChange={(e) => onChange("img", e.target.value)}
                  placeholder="Paste image URL here (https://...)"
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
              placeholder="What did they love about their Taruveda order?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:border-[#2874F0] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex flex-col-reverse sm:flex-row items-center gap-3 justify-end">
          {!isValid && (
            <span className="text-sm text-red-500 font-medium sm:mr-auto">
              Name and message are required.
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

// ─── Main Page ────────────────────────────────────────────────────────────────

const TestimonialsAdminPage = () => {
  const {
    testimonials,
    loading,
    error,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialStatus,
    clearError,
  } = useTestimonials();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((type, msg) => {
    clearTimeout(toastTimer.current);
    setToast({ type, msg });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    if (error) {
      showToast("error", error);
      clearError();
    }
  }, [error, clearError, showToast]);

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (t) => {
    setFormData({
      name: t.name ?? "",
      img: t.img ?? "",
      message: t.message ?? "",
      rating: t.rating ?? 5,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleFieldChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.message.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateTestimonial(editingId, formData);
        showToast("success", "Review updated successfully!");
      } else {
        await addTestimonial(formData);
        showToast("success", "New review added successfully!");
      }
      closeForm();
    } catch {
      // Handled by hook
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (t) => {
    if (toggling) return;
    setToggling(t.id);
    try {
      await toggleTestimonialStatus(t.id, !t.isActive);
      showToast(
        "success",
        `Review is now ${!t.isActive ? "visible to customers" : "hidden from store"}.`,
      );
    } catch {
      // Handled by hook
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (t) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the review from ${t.name}?`,
      )
    )
      return;
    try {
      await deleteTestimonial(t.id);
      showToast("success", "Review deleted.");
    } catch {
      // Handled by hook
    }
  };

  const total = testimonials.length;
  const live = testimonials.filter((t) => t.isActive).length;
  const avgRating = total
    ? (testimonials.reduce((s, t) => s + (t.rating ?? 5), 0) / total).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#2874F0]">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-base font-bold text-gray-600">
            Gathering Reviews...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-gray-900 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-5 py-4 rounded-lg shadow-xl border text-sm font-bold max-w-sm animate-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
          {toast.type === "success" ? (
            <CheckCircle2 size={20} className="shrink-0" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}
          <span className="flex-1">{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Modal Form */}
      <TestimonialModal
        isOpen={showForm}
        formData={formData}
        onChange={handleFieldChange}
        onSave={handleSave}
        onCancel={closeForm}
        saving={saving}
        isEdit={Boolean(editingId)}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Customer Reviews
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage the testimonials shown on your store front.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-[#2874F0] text-white px-6 py-3.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all text-base w-full sm:w-auto">
            <Plus size={20} /> Add New Review
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            icon={MessageCircle}
            label="Total Reviews"
            value={total}
            color="bg-[#2874F0]"
          />
          <StatCard
            icon={UserCheck}
            label="Visible on Store"
            value={live}
            color="bg-green-500"
          />
          <StatCard
            icon={Star}
            label="Average Rating"
            value={avgRating}
            color="bg-[#FF9900]"
          />
        </div>

        {/* Empty State */}
        {total === 0 && !showForm && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-base text-gray-600 max-w-md mb-8">
              Add your first customer testimonial to build trust and increase
              sales on your store.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#FB641B] text-white px-8 py-3.5 rounded-lg font-bold text-base hover:bg-[#f4511e] transition-colors shadow-sm">
              <Plus size={20} /> Add First Review
            </button>
          </div>
        )}

        {/* Reviews Grid */}
        {total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                        <img
                          src={t.img || FALLBACK_SVG}
                          alt={t.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = FALLBACK_SVG;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">
                          {t.name}
                        </p>
                        <div className="mt-1">
                          <Stars rating={t.rating ?? 5} size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed italic">
                    "{t.message}"
                  </p>
                </div>

                <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between gap-3 rounded-b-xl">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(t)}
                    disabled={toggling === t.id}
                    className="flex items-center gap-2.5 group/switch outline-none shrink-0"
                    title={
                      t.isActive ? "Hide this review" : "Show this review"
                    }>
                    <div
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ease-in-out duration-200 ${t.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                      {toggling === t.id ? (
                        <Loader2
                          size={12}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-spin"
                        />
                      ) : (
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ease-in-out duration-200 ${t.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${t.isActive ? "text-green-700" : "text-gray-500"}`}>
                      {t.isActive ? "Visible" : "Hidden"}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-2.5 text-gray-600 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-colors border border-transparent">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsAdminPage;
