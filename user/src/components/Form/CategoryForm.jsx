import React from "react";

const CategoryForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  // Add a new empty subcategory
  const handleAddSubcategory = () => {
    setFormData({
      ...formData,
      subcategories: [
        ...(formData.subcategories || []),
        { name: "", description: "", image: "", isActive: true },
      ],
    });
  };

  // Update a specific subcategory
  const handleSubcategoryChange = (index, key, value) => {
    const updatedSubs = [...(formData.subcategories || [])];
    updatedSubs[index][key] = value;
    setFormData({ ...formData, subcategories: updatedSubs });
  };

  // Remove a subcategory
  const handleRemoveSubcategory = (index) => {
    const updatedSubs = [...formData.subcategories];
    updatedSubs.splice(index, 1);
    setFormData({ ...formData, subcategories: updatedSubs });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-lg p-2 mt-1"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg p-2 mt-1"
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/category.jpg"
          className="w-full border border-gray-300 rounded-lg p-2 mt-1"
        />
      </div>

      {/* Active Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="mr-2"
        />
        <label className="text-sm text-gray-700">Active</label>
      </div>

      {/* Subcategories */}
      <div className="max-h-96 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-700">Subcategories</h3>
        {(formData.subcategories || []).map((sub, index) => (
          <div key={index} className="border p-2 rounded-md space-y-1">
            <input
              type="text"
              placeholder="Subcategory Name"
              value={sub.name}
              onChange={(e) =>
                handleSubcategoryChange(index, "name", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg p-1"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={sub.description}
              onChange={(e) =>
                handleSubcategoryChange(index, "description", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg p-1"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={sub.image}
              onChange={(e) =>
                handleSubcategoryChange(index, "image", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg p-1"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sub.isActive}
                onChange={(e) =>
                  handleSubcategoryChange(index, "isActive", e.target.checked)
                }
              />
              <span>Active</span>
              <button
                type="button"
                onClick={() => handleRemoveSubcategory(index)}
                className="ml-auto text-red-500 hover:text-red-700">
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddSubcategory}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Add Subcategory
        </button>
      </div>
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        className="w-full border p-2 rounded mb-3"
      />

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {isEdit ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
