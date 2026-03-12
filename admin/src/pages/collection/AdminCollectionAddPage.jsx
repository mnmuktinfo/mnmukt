import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Check,
  Loader2,
  Tag,
  PenLine,
} from "lucide-react";
import {
  addItemApi,
  updateItemApi,
  fetchItemsApi,
} from "../../services/firebase/collection/collectionApi";
import { uploadImageToCloudinary } from "../../services/cloudinary/uploadImage";

const AdminCollectionAddPage = ({ collectionName = "itemsCollection" }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit
  const [formData, setFormData] = useState({ name: "", imageUrl: "" });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fetching, setFetching] = useState(Boolean(id));

  const cloudName = import.meta.env.VITE_CLOUDINARY_COLLECTION;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_ADMIN_UPLOAD_PRESET;

  // Load existing item if editing
  useEffect(() => {
    if (!id) return;
    (async () => {
      setFetching(true);
      try {
        const items = await fetchItemsApi(collectionName);
        const item = items.find((i) => i.id === id);
        if (item) setFormData({ name: item.name, imageUrl: item.imageUrl });
      } catch (err) {
        console.error("[Load Item] Error:", err);
      } finally {
        setFetching(false);
      }
    })();
  }, [id, collectionName]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { url } = await uploadImageToCloudinary(
        file,
        cloudName,
        uploadPreset,
      );
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Name is required");

    try {
      setLoading(true);
      if (id) {
        await updateItemApi(collectionName, id, formData);
        alert("Item updated successfully!");
      } else {
        await addItemApi(collectionName, formData);
        alert("Item added successfully!");
      }
      navigate("/collection/list");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING STATE
  // =========================
  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2874f0] w-10 h-10" />
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-[#f1f3f6] px-4 py-8 font-sans text-[#212121]">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/collection/list")}
          className="flex items-center gap-2 text-[#2874f0] font-medium hover:underline mb-4 text-sm transition-all w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-medium text-[#212121]">
              {id ? "Edit Item Details" : "Add New Item"}
            </h1>
            <p className="text-xs text-[#878787] mt-1">
              Adding to collection:{" "}
              <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600">
                {collectionName}
              </span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            <div className="p-8 space-y-8">
              {/* Name Input */}
              <div>
                <label className="flex gap-2 items-center text-sm font-medium text-[#878787] mb-2">
                  <Tag className="w-4 h-4 text-[#2874f0]" /> Item Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[15px] text-[#212121] focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. Vintage Leather Jacket"
                  required
                />
              </div>

              {/* Image Upload Widget */}
              <div>
                <label className="flex gap-2 items-center text-sm font-medium text-[#878787] mb-3">
                  <ImageIcon className="w-4 h-4 text-[#2874f0]" /> Item Image
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 border border-gray-200 rounded-sm bg-[#fafafa]">
                  {/* Image Preview Box */}
                  <div
                    className={`w-28 h-28 shrink-0 flex items-center justify-center overflow-hidden bg-white ${formData.imageUrl ? "border border-gray-200 shadow-sm" : "border-2 border-dashed border-gray-300"}`}>
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        className="w-full h-full object-contain"
                        alt="Preview"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 font-medium text-center px-2">
                        No Image Selected
                      </span>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-[#212121] mb-1">
                      Upload a clear product image
                    </h3>
                    <p className="text-xs text-[#878787] mb-4">
                      Recommended size: 500x500px. Image should ideally have a
                      white or transparent background.
                    </p>

                    <label
                      className={`inline-flex cursor-pointer bg-white border border-[#d7d7d7] text-[#212121] px-5 py-2 rounded-sm text-sm font-medium items-center gap-2 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] transition-colors ${imageUploading || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}>
                      {imageUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#2874f0]" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-[#2874f0]" />
                          Choose File
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                        disabled={imageUploading || loading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-4 bg-white border-t border-gray-200 flex items-center justify-end gap-4 shadow-[0_-1px_2px_0_rgba(0,0,0,0.05)]">
              <button
                type="button"
                onClick={() => navigate("/collection/list")}
                disabled={loading || imageUploading}
                className="text-[15px] font-medium text-[#212121] px-4 py-2 hover:text-[#2874f0] transition-colors disabled:opacity-50">
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || imageUploading}
                className="bg-[#2874f0] text-white px-8 py-2.5 rounded-sm text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-[#1c5fba] transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] disabled:opacity-70 min-w-[140px]">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {id ? (
                      <PenLine className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {id ? "Update Item" : "Save Item"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCollectionAddPage;
