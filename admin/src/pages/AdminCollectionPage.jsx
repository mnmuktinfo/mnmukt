import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MessageCircle } from "lucide-react";
import { useFirebaseCollection } from "../hooks/useCollection";
import Notification from "../../shared/components/Notification";
import AdminCollectionCard from "../components/cards/AdminCollectionCard";

const AdminCollectionPage = ({ collectionName = "itemsCollection" }) => {
  const navigate = useNavigate();
  const { items, loading, error, fetchAll, addItem, deleteItem, updateItem } =
    useFirebaseCollection(collectionName);

  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", imageUrl: "" });

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ type, message, duration });
  };
  const hideNotification = () => setNotification(null);

  // Fetch data on mount
  useEffect(() => {
    fetchAll().catch((err) => showNotification("error", err.message));
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) showNotification("error", error);
  }, [error]);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || "",
      imageUrl: item.imageUrl || "",
    });

    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: "", imageUrl: "" });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showNotification("error", "Name is required");
      return;
    }

    try {
      await updateItem(editingId, formData);
      handleCancel();
      showNotification("success", "Item updated successfully!");
      fetchAll();
    } catch (err) {
      showNotification("error", err.message);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      showNotification("error", "Name is required");
      return;
    }

    try {
      await addItem(formData);
      handleCancel();
      showNotification("success", "Item added successfully!");
      fetchAll();
    } catch (err) {
      showNotification("error", err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteItem(id);
        showNotification("success", "Item deleted successfully!");
        fetchAll();
      } catch (err) {
        showNotification("error", err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B4292F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage {collectionName}
            </h1>
            <p className="text-gray-600">
              Add, edit, and manage items in this collection
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#B4292F] text-white rounded-xl font-semibold hover:bg-[#9c2227] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-4 lg:mt-0">
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showAddForm && (
            <AdminCollectionCard
              formData={formData}
              setFormData={setFormData}
              handleAdd={handleAdd}
              handleCancel={handleCancel}
            />
          )}
          {items.length > 0 ? (
            items.map((item) => (
              <AdminCollectionCard
                key={item.id}
                item={item}
                editingId={editingId}
                formData={formData}
                setFormData={setFormData}
                handleSave={handleSave}
                handleAdd={handleAdd}
                handleCancel={handleCancel}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-12 col-span-full">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Items Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add items to this collection to get started
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-[#B4292F] text-white rounded-lg font-semibold hover:bg-[#9c2227] transition-colors">
                Add First Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
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

export default AdminCollectionPage;
