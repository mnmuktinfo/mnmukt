// src/pages/Admin/AdminCategoryPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../../config";
import { PlusCircle, X } from "lucide-react";
import CategoryForm from "../../components/Form/CategoryForm";
import Button from "../../components/ui/Buttons/PrimaryButton";

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // ✅ One object state for form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    price: "",
    isActive: true,
    subcategories: [],
  });

  // API: Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api}/category`);
      console.log(res);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // API: Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${api}/category`, formData);
      fetchCategories();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("❌ Error adding category:", err);
      alert("Failed to add category");
    }
  };

  // API: Update Category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${api}/category/${formData._id}`, formData);
      fetchCategories();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("❌ Error updating category:", err);
      alert("Failed to update category");
    }
  };

  // API: Delete Category
  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`${api}/category/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("❌ Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      isActive: true,
      subcategories: [],
    });
    setIsEdit(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Categories</h2>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      {categories.length === 0 ? (
        <p className="text-gray-600">No categories found. Add a new one!</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-gray-700 font-semibold">#</th>
                <th className="p-3 text-left text-gray-700 font-semibold">
                  Name
                </th>
                <th className="p-3 text-left text-gray-700 font-semibold">
                  Description
                </th>
                <th className="p-3 text-center text-gray-700 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr
                  key={cat._id}
                  className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3 text-gray-600">
                    {cat.description || "—"}
                  </td>
                  <td className="p-3 flex justify-center space-x-2">
                    <Button
                      label="Delete"
                      type="primary"
                      onClick={() => handleDeleteCategory(cat._id)}
                    />
                    <Button
                      label="Edit"
                      type="secondary"
                      onClick={() => {
                        setFormData(cat);
                        setIsEdit(true);
                        setShowModal(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-4">
              {isEdit ? "Edit Category" : "Add New Category"}
            </h3>

            {/* ✅ Reusable Form with formData */}
            <CategoryForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={isEdit ? handleUpdateCategory : handleAddCategory}
              onCancel={() => {
                setShowModal(false);
                resetForm();
              }}
              isEdit={isEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryPage;
