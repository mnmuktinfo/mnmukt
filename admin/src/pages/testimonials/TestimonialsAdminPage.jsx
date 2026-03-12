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
  UserCheck,
} from "lucide-react";
import { testimonialService } from "../../services/firebase/testimonial/testimonialService";
import TestimonialModal from "../../components/testimonials/TestimonialModal";

const EMPTY_FORM = { name: "", img: "", message: "", rating: 5 };

const TestimonialsAdminPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Toast handler
  const showToast = useCallback((type, msg) => {
    clearTimeout(toastTimer.current);
    setToast({ type, msg });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // Load testimonials
  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await testimonialService.getAll();
      setTestimonials(data);
    } catch (err) {
      showToast("error", err.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  // Form handlers
  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (t) => {
    setFormData({
      name: t.name || "",
      img: t.img || "",
      message: t.message || "",
      rating: t.rating || 5,
    });
    setEditingId(t.id);
    setShowForm(true);
  };
  const closeForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };
  const handleFieldChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.message.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await testimonialService.update(editingId, formData);
        showToast("success", "Review updated successfully!");
      } else {
        await testimonialService.create(formData);
        showToast("success", "New review added successfully!");
      }
      await loadTestimonials();
      closeForm();
    } catch (err) {
      showToast("error", err.message || "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle review visibility
  const handleToggle = async (t) => {
    if (toggling) return;
    setToggling(t.id);
    try {
      await testimonialService.update(t.id, { isActive: !t.isActive });
      showToast(
        "success",
        `Review is now ${!t.isActive ? "visible" : "hidden"}.`,
      );
      await loadTestimonials();
    } catch (err) {
      showToast("error", err.message || "Failed to toggle review.");
    } finally {
      setToggling(null);
    }
  };

  // Delete review
  const handleDelete = async (t) => {
    if (!window.confirm(`Delete review from ${t.name}?`)) return;
    try {
      await testimonialService.delete(t.id);
      showToast("success", "Review deleted.");
      await loadTestimonials();
    } catch (err) {
      showToast("error", err.message || "Failed to delete review.");
    }
  };

  const total = testimonials.length;
  const live = testimonials.filter((t) => t.isActive).length;
  const avgRating = total
    ? (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / total).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#2874F0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] md:mt-5 font-sans text-gray-900 pb-20">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-200 flex items-center gap-3 px-5 py-4 rounded-lg shadow-xl border text-sm font-bold max-w-sm animate-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
          {toast.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
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

      {/* Stats */}
      <div className="max-w-350 mx-auto px-4 sm:px-6 py-8 space-y-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2874F0]">
            <MessageCircle size={24} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none mb-1">
              {total}
            </p>
            <p className="text-sm text-gray-500 font-medium">Total Reviews</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500">
            <UserCheck size={24} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none mb-1">
              {live}
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Visible on Store
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FF9900]">
            <Star size={24} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none mb-1">
              {avgRating}
            </p>
            <p className="text-sm text-gray-500 font-medium">Average Rating</p>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                    <img
                      src={t.img || ""}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {t.name}
                    </p>
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < (t.rating || 5)
                              ? "text-[#FF9900] fill-[#FF9900]"
                              : "text-gray-200 fill-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-base text-gray-700 leading-relaxed italic">
                "{t.message}"
              </p>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between gap-3 rounded-b-xl">
              <button
                onClick={() => handleToggle(t)}
                disabled={toggling === t.id}
                className="flex items-center gap-2.5">
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${t.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                  {toggling === t.id ? (
                    <Loader2
                      size={12}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-spin"
                    />
                  ) : (
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${t.isActive ? "translate-x-5" : "translate-x-0.5"}`}
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
                  className="p-2.5 text-gray-600 hover:text-[#2874F0] hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsAdminPage;
