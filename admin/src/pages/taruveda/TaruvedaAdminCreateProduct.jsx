import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  Plus,
  X,
  IndianRupee,
  Image as ImageIcon,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

import { productService } from "../../services/firebase/taruveda";
import { uploadMultipleImages } from "../../services/cloudinary/uploadImage";

export default function TaruvedaAdminCreateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_TARUVEDA_UPLOAD_PRESET;

  /* ---------------- LOAD PRODUCT (EDIT MODE) ---------------- */

  useEffect(() => {
    if (!isEdit) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const product = await productService.getTaruvedaProductById(id);

        if (!product) {
          setError("Product not found or has been removed.");
          return;
        }

        setFormData({
          name: product.name || "",
          category: product.category || "",
          price: product.price || "",
          images: product.images || [],
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load product details from the server.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  /* ---------------- HANDLE INPUT ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear error when user starts typing again
    if (error) setError(null);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    try {
      setUploadingImages(true);
      setError(null);

      const uploaded = await uploadMultipleImages(
        files,
        cloudName,
        uploadPreset,
      );

      const imageUrls = uploaded.map((img) => img.url);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Image upload failed. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setUploadingImages(false);
    }
  };

  /* ---------------- REMOVE IMAGE ---------------- */

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /* ---------------- SAVE PRODUCT ---------------- */

  const handleSubmit = async () => {
    // UI Upgrade: Use inline errors instead of alert()
    if (!formData.name.trim()) {
      setError("Product Name is a required field.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.price) {
      setError("Selling Price is a required field.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        price: Number(formData.price),
        updatedAt: new Date(),
      };

      if (isEdit) {
        await productService.updateTaruvedaProduct(id, payload);
      } else {
        await productService.createTaruvedaProduct({
          ...payload,
          createdAt: new Date(),
        });
      }

      navigate("/taruveda/products");
    } catch (err) {
      console.error(err);
      setError(
        "Failed to save product. Please check your connection and try again.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  if (loading && isEdit && !formData.name) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin w-10 h-10 text-[#2874F0] mb-4" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
          Loading Listing...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Breadcrumbs */}
      <div className="text-[11px] text-gray-500 flex items-center gap-2 uppercase tracking-wider font-bold mb-6">
        <span
          className="hover:text-[#2874F0] cursor-pointer"
          onClick={() => navigate("/admin/products")}>
          Inventory
        </span>
        <ChevronRight size={14} />
        <span className="text-gray-900">
          {isEdit ? "Edit Listing" : "Add New Listing"}
        </span>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-sm flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold">Action Required</h3>
            <p className="text-xs mt-1 font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* --- LEFT COLUMN (FORM) --- */}
        <div className="flex-1 space-y-6">
          {/* General Info Card */}
          <section className="bg-white shadow-sm border border-gray-200 rounded-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                1. General Information
              </h2>
              <HelpCircle size={16} className="text-gray-400" />
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Taruveda Onion Hair Oil (200ml)"
                  className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-sm px-4 py-3 text-sm bg-white focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] outline-none transition-all cursor-pointer">
                    <option value="">Select Category</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Body Care">Body Care</option>
                    <option value="Combos">Combos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Listing Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-r border-gray-200 pr-3">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-sm pl-12 pr-4 py-3 text-sm focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Images Card */}
          <section className="bg-white shadow-sm border border-gray-200 rounded-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                2. Product Media
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {/* Uploaded Images */}
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-square border border-gray-200 rounded-sm overflow-hidden relative group bg-white p-1">
                    <img
                      src={img}
                      alt={`Product media ${index + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#2874F0] text-white text-[9px] font-bold text-center py-1 uppercase tracking-wider">
                        Main Image
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                      title="Remove image">
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                <div className="aspect-square border-2 border-dashed border-gray-300 hover:border-[#2874F0] rounded-sm flex flex-col items-center justify-center relative group bg-gray-50 hover:bg-blue-50/50 transition-colors">
                  {uploadingImages ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin w-6 h-6 text-[#2874F0] mb-2" />
                      <span className="text-[10px] font-bold text-[#2874F0] uppercase tracking-wider">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="text-gray-400 w-8 h-8 mb-2 group-hover:text-[#2874F0] transition-colors" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#2874F0] transition-colors">
                        Add Photo
                      </span>
                    </>
                  )}

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    title="Upload product images"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 font-medium">
                Tip: The first image will be used as the display cover. Upload
                high-quality PNG or JPG files.
              </p>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImages}
              className="flex-1 sm:flex-none sm:w-64 py-4 bg-[#fb641b] text-white text-sm font-bold uppercase tracking-wider rounded-sm shadow-md hover:bg-[#f4511e] transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Publish Listing"
              )}
            </button>

            <button
              onClick={() => navigate("/admin/products")}
              disabled={loading}
              className="flex-1 sm:flex-none sm:w-48 py-4 bg-white border border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wider rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>

        {/* --- RIGHT COLUMN (SELLER TIPS) --- */}
        <div className="hidden lg:block w-[320px]">
          <div className="bg-[#FFF9E6] border border-[#F7E6A1] p-5 rounded-sm sticky top-24 shadow-sm">
            <h3 className="text-[#856404] font-bold text-sm mb-4 flex items-center gap-2">
              <span className="text-lg">💡</span> Listing Guidelines
            </h3>
            <ul className="text-xs text-[#856404] space-y-4 leading-relaxed font-medium">
              <li>
                <strong className="block text-[#664d03] mb-0.5">
                  Title Format:
                </strong>
                Keep titles under 70 characters. Include brand name, product
                type, and quantity (e.g., 200ml).
              </li>
              <li>
                <strong className="block text-[#664d03] mb-0.5">
                  Image Quality:
                </strong>
                Use clean, brightly lit images with a white background. Products
                with 3+ images get 40% more sales.
              </li>
              <li>
                <strong className="block text-[#664d03] mb-0.5">
                  Competitive Pricing:
                </strong>
                Ensure your final price accounts for all packaging and shipping
                costs to avoid losses.
              </li>
            </ul>
            <hr className="my-4 border-[#F7E6A1]" />
            <p className="text-[11px] text-gray-500">
              Need help?{" "}
              <a href="#" className="text-[#2874F0] font-bold hover:underline">
                Read Seller Docs
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
