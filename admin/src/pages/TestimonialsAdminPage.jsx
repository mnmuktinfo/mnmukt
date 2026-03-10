import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Star,
  MessageCircle,
  Upload,
} from "lucide-react";
import { useTestimonials } from "../hooks/useTestimonials";
import Notification from "../components/notification/Notification";

const TestimonialsAdminPage = () => {
  const navigate = useNavigate();
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

  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    img: "",
    message: "",
    rating: 5,
  });

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ type, message, duration });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Handle errors from the hook
  useEffect(() => {
    if (error) {
      showNotification("error", error);
      clearError();
    }
  }, [error, clearError]);

  const handleEdit = (testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      name: testimonial.name || "",
      img: testimonial.img || "",
      message: testimonial.message || "",
      rating: testimonial.rating || 5,
    });
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: "", img: "", message: "", rating: 5 });
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.message.trim()) {
        showNotification("error", "Please fill in all required fields");
        return;
      }

      await updateTestimonial(editingId, formData);
      handleCancel();
      showNotification("success", "Testimonial updated successfully!");
    } catch (err) {
      // Error is handled by the hook and useEffect above
    }
  };

  const handleAdd = async () => {
    try {
      if (!formData.name.trim() || !formData.message.trim()) {
        showNotification("error", "Please fill in all required fields");
        return;
      }

      await addTestimonial(formData);
      handleCancel();
      showNotification("success", "Testimonial added successfully!");
    } catch (err) {
      // Error is handled by the hook and useEffect above
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete testimonial from ${name}?`,
      )
    ) {
      try {
        await deleteTestimonial(id);
        showNotification("success", "Testimonial deleted successfully!");
      } catch (err) {
        // Error is handled by the hook and useEffect above
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    try {
      await toggleTestimonialStatus(id, !currentStatus);
      showNotification(
        "success",
        `Testimonial from ${name} ${
          !currentStatus ? "activated" : "deactivated"
        }!`,
      );
    } catch (err) {
      // Error is handled by the hook and useEffect above
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4292F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto p-6">
        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingId ? "Edit Testimonial" : "Add New Testimonial"}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                    placeholder="Enter customer name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className={`p-2 rounded-lg transition-colors ${
                          formData.rating >= rating
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                        <Star className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Photo URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                      placeholder="https://example.com/photo.jpg"
                      value={formData.img}
                      onChange={(e) =>
                        setFormData({ ...formData, img: e.target.value })
                      }
                    />
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {formData.img && (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                      <img
                        src={formData.img}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%239ca3af'%3EInvalid URL%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">Photo Preview</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testimonial Message *
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200 resize-none"
                placeholder="What did the customer say about your product/service?"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingId ? handleSave : handleAdd}
                className="flex-1 px-6 py-3 bg-[#B4292F] text-white rounded-xl font-semibold hover:bg-[#9c2227] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                <Save className="w-5 h-5" />
                {editingId ? "Update Testimonial" : "Add Testimonial"}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2">
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              {/* Status Badge */}
              <div
                className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                  testimonial.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                {testimonial.isActive ? "Active" : "Inactive"}
              </div>

              {editingId === testimonial.id ? (
                // This part is handled by the form above
                <></>
              ) : (
                <>
                  {/* Customer Photo and Info */}
                  <div className="text-center mb-4">
                    <div className="relative inline-block">
                      <img
                        src={testimonial.img || "/placeholder.png"}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {testimonial.name}
                    </h3>
                    <div className="flex justify-center items-center gap-1 mb-2">
                      {renderStars(testimonial.rating || 5)}
                    </div>
                  </div>

                  {/* Testimonial Message */}
                  <p className="text-sm text-gray-600 text-center leading-relaxed mb-4 line-clamp-4">
                    {testimonial.message}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          testimonial.id,
                          testimonial.isActive,
                          testimonial.name,
                        )
                      }
                      className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        testimonial.isActive
                          ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}>
                      {testimonial.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      {testimonial.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(testimonial.id, testimonial.name)
                      }
                      className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {testimonials.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Testimonials Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first customer testimonial
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[#B4292F] text-white rounded-lg font-semibold hover:bg-[#9c2227] transition-colors">
              Add First Testimonial
            </button>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};

export default TestimonialsAdminPage;
