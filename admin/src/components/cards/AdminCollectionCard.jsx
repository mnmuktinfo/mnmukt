import React from "react";
import { Edit, Trash2, Save, X, Upload } from "lucide-react";

const AdminCollectionCard = ({
  item,
  editingId,
  formData,
  setFormData,
  handleSave,
  handleAdd,
  handleCancel,
  handleEdit,
  handleDelete,
}) => {
  // Add/Edit form
  if (!item || editingId === item?.id) {
    const isEditing = Boolean(editingId);
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-md col-span-full">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {isEditing ? "Edit Item" : "Add New Item"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {formData.imageUrl && (
              <div className="flex items-center gap-3 mt-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%239ca3af'%3EInvalid URL%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500">Preview</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={isEditing ? handleSave : handleAdd}
            className="flex-1 px-6 py-3 bg-[#B4292F] text-white rounded-xl font-semibold hover:bg-[#9c2227] transition-all duration-200 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {isEditing ? "Update" : "Add"}
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2">
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Display card
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
      {item.imageUrl && (
        <div className="text-center mb-4">
          <div className="relative inline-block">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-white shadow-lg"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleEdit(item)}
          className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => handleDelete(item.id, item.name)}
          className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default AdminCollectionCard;
