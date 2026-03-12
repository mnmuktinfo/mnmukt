import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaTag,
  FaImage,
  FaUpload,
  FaPenNib,
} from "react-icons/fa6";
import { BiLoaderAlt } from "react-icons/bi";

import {
  getCategoryById,
  createCategoryApi,
  updateCategoryApi,
} from "../../services/firebase/category/categoryApi";

import { uploadImageToCloudinary } from "../../services/cloudinary/uploadImage";

const CLOUD_NAME = "your_cloud_name";
const UPLOAD_PRESET = "your_upload_preset";

const CategoryCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [category, setCategory] = useState({ name: "", image: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [imageUploading, setImageUploading] = useState(false);
  const [notice, setNotice] = useState(null);

  // =========================
  // FETCH CATEGORY
  // =========================
  useEffect(() => {
    if (!isEditMode) return;

    const loadCategory = async () => {
      try {
        const data = await getCategoryById(id);
        setCategory({
          name: data.name || "",
          image: data.image || "",
        });
      } catch (err) {
        setNotice({ type: "error", message: err.message });
      } finally {
        setFetching(false);
      }
    };

    loadCategory();
  }, [id, isEditMode]);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
  };

  // =========================
  // IMAGE UPLOAD
  // =========================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      const result = await uploadImageToCloudinary(
        file,
        CLOUD_NAME,
        UPLOAD_PRESET,
      );

      setCategory((prev) => ({ ...prev, image: result.url }));
      setNotice({ type: "success", message: "Image uploaded successfully" });
    } catch (err) {
      setNotice({ type: "error", message: err.message });
    } finally {
      setImageUploading(false);
    }
  };

  // =========================
  // CREATE / UPDATE CATEGORY
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category.name || !category.image) {
      setNotice({ type: "error", message: "Name and image are required" });
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await updateCategoryApi(id, category);
        setNotice({
          type: "success",
          message: "Category updated successfully",
        });
      } else {
        await createCategoryApi(category);
        setNotice({
          type: "success",
          message: "Category created successfully",
        });
      }

      setTimeout(() => navigate("/categories"), 1200);
    } catch (err) {
      setNotice({ type: "error", message: err.message });
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
        <BiLoaderAlt className="animate-spin text-[#2874f0]" size={40} />
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
          onClick={() => navigate("/categories")}
          className="flex items-center gap-2 text-[#2874f0] font-medium hover:underline mb-4 text-sm transition-all">
          <FaArrowLeft /> Back to Categories
        </button>

        {/* Notice Banner */}
        {notice && (
          <div
            className={`mb-4 px-4 py-3 text-sm font-medium rounded-sm shadow-sm flex items-center gap-2 ${
              notice.type === "success"
                ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]"
                : "bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]"
            }`}>
            {notice.type === "success" ? <FaCheck /> : null}
            {notice.message}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-medium text-[#212121]">
              {isEditMode ? "Edit Category Details" : "Add New Category"}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* Category Name Input */}
              <div>
                <label className="flex gap-2 items-center text-sm font-medium text-[#878787] mb-2">
                  <FaTag className="text-[#2874f0]" /> Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={category.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[15px] text-[#212121] focus:border-[#2874f0] focus:outline-none transition-colors placeholder-gray-400"
                  placeholder="e.g. Electronics, Clothing, Footwear..."
                  required
                />
              </div>

              {/* Category Image Upload */}
              <div>
                <label className="flex gap-2 items-center text-sm font-medium text-[#878787] mb-3">
                  <FaImage className="text-[#2874f0]" /> Category Image
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 border border-gray-200 rounded-sm bg-[#fafafa]">
                  {/* Image Preview Box */}
                  <div
                    className={`w-28 h-28 shrink-0 flex items-center justify-center overflow-hidden bg-white ${category.image ? "border border-gray-200 shadow-sm" : "border-2 border-dashed border-gray-300"}`}>
                    {category.image ? (
                      <img
                        src={category.image}
                        className="w-full h-full object-contain"
                        alt="Category Preview"
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
                      Upload a clear category image
                    </h3>
                    <p className="text-xs text-[#878787] mb-4">
                      Recommended size: 500x500px. Image should have a white
                      background for best visibility on the platform.
                    </p>

                    <label className="inline-flex cursor-pointer bg-white border border-[#d7d7d7] text-[#212121] px-5 py-2 rounded-sm text-sm font-medium items-center gap-2 hover:bg-gray-50 transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]">
                      {imageUploading ? (
                        <>
                          <BiLoaderAlt
                            className="animate-spin text-[#2874f0]"
                            size={16}
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload className="text-[#2874f0]" />
                          Choose File
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                        disabled={imageUploading}
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
                onClick={() => navigate("/categories")}
                disabled={loading}
                className="text-[15px] font-medium text-[#212121] px-4 py-2 hover:text-[#2874f0] transition-colors disabled:opacity-50">
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#2874f0] text-white px-8 py-2.5 rounded-sm text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-[#1c5fba] transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] disabled:opacity-70 min-w-[160px]">
                {loading ? (
                  <BiLoaderAlt className="animate-spin" size={20} />
                ) : (
                  <>
                    {isEditMode ? <FaPenNib /> : <FaCheck />}
                    {isEditMode ? "Save Changes" : "Save Category"}
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

export default CategoryCreatePage;
