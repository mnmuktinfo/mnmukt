import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Sparkles,
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Palette,
  Ruler,
} from "lucide-react";

import { CATEGORIES } from "../../constants/categories";
import { COLLECTIONS } from "../../constants/collections";
import { productService } from "../../services/firebase/productService";
import {
  uploadImageToCloudinary,
  uploadMultipleImages,
} from "../../services/cloudinary/uploadImage";

// ─── Constants ────────────────────────────────────────────────────────────────

// Quick-select standard sizes
const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const INITIAL_PRODUCT = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: "",
  banner: "",
  categoryId: "",
  collectionType: "",
  images: [],
  colors: [],
  sizes: [],
  material: "",
  brand: "",
  isActive: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

// ─── Reusable UI ──────────────────────────────────────────────────────────────

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-4 py-3 border border-gray-300 rounded-sm text-sm
      text-gray-900 placeholder:text-gray-400 bg-white outline-none
      focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]
      transition-all disabled:bg-gray-50 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-4 py-3 border border-gray-300 rounded-sm text-sm
      text-gray-900 placeholder:text-gray-400 bg-white outline-none resize-none
      focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all
      ${className}`}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full px-4 py-3 border border-gray-300 rounded-sm text-sm
      text-gray-900 bg-white outline-none cursor-pointer
      focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all
      ${className}`}
    {...props}>
    {children}
  </select>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-bold text-gray-700 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Card = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
      {Icon && <Icon size={16} className="text-gray-500 shrink-0" />}
      <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
        {title}
      </h2>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  a;
  const isEditing = Boolean(id);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_ADMIN_UPLOAD_PRESET;

  const [product, setProduct] = useState(INITIAL_PRODUCT);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingColorIdx, setUploadingColorIdx] = useState(null);

  // Custom size input state
  const [customSizeInput, setCustomSizeInput] = useState("");
  const customSizeRef = useRef(null);

  // ── Load for editing ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setPageLoading(true);
        const data = await productService.getProduct(id);
        setProduct({
          ...INITIAL_PRODUCT,
          ...data,
          price: data.price?.toString() ?? "",
          originalPrice: data.originalPrice?.toString() ?? "",
          stock: data.stock?.toString() ?? "",
          images: data.images?.filter(Boolean) ?? [],
          colors: data.colors?.length ? data.colors : [],
          sizes: data.sizes ?? [],
          categoryId: data.categoryId ?? "",
          collectionType: data.collectionType ?? "",
        });
      } catch (err) {
        setError("Could not load this product. Please go back and try again.");
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id]);

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setError(null);
    setProduct((p) => ({ ...p, [name]: value }));
  }, []);

  // ── Image uploads ─────────────────────────────────────────────────────────
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingBanner(true);
      setError(null);
      const res = await uploadImageToCloudinary(file, cloudName, uploadPreset);
      setProduct((p) => ({ ...p, banner: res.url }));
    } catch (err) {
      setError("Main photo upload failed — " + err.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    try {
      setUploadingGallery(true);
      setError(null);
      const res = await uploadMultipleImages(files, cloudName, uploadPreset);
      setProduct((p) => ({
        ...p,
        images: [...p.images, ...res.map((r) => r.url)],
      }));
    } catch (err) {
      setError("Gallery upload failed — " + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleColorImageUpload = async (e, idx) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingColorIdx(idx);
      setError(null);
      const res = await uploadImageToCloudinary(file, cloudName, uploadPreset);
      setProduct((p) => ({
        ...p,
        colors: p.colors.map((c, i) =>
          i === idx ? { ...c, image: res.url } : c,
        ),
      }));
    } catch (err) {
      setError("Color photo upload failed — " + err.message);
    } finally {
      setUploadingColorIdx(null);
    }
  };

  // ── Colors CRUD ───────────────────────────────────────────────────────────
  const addColor = () =>
    setProduct((p) => ({
      ...p,
      colors: [...p.colors, { name: "", image: "" }],
    }));
  const removeColor = (idx) =>
    setProduct((p) => ({ ...p, colors: p.colors.filter((_, i) => i !== idx) }));
  const updateColorName = (idx, val) =>
    setProduct((p) => ({
      ...p,
      colors: p.colors.map((c, i) => (i === idx ? { ...c, name: val } : c)),
    }));

  // ── Size helpers ──────────────────────────────────────────────────────────

  // Toggle one of the preset chips (XS, S, M…)
  const togglePresetSize = (size) =>
    setProduct((p) => ({
      ...p,
      sizes: p.sizes.includes(size)
        ? p.sizes.filter((s) => s !== size)
        : [...p.sizes, size],
    }));

  // Add a custom size (number or free text)
  const addCustomSize = () => {
    const val = customSizeInput.trim();
    if (!val) return;
    if (product.sizes.includes(val)) {
      setCustomSizeInput("");
      return;
    }
    setProduct((p) => ({ ...p, sizes: [...p.sizes, val] }));
    setCustomSizeInput("");
    customSizeRef.current?.focus();
  };

  // Remove any size (preset or custom)
  const removeSize = (size) =>
    setProduct((p) => ({ ...p, sizes: p.sizes.filter((s) => s !== size) }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (!product.name.trim()) return setError("Please enter the product name.");
    if (!product.categoryId) return setError("Please select a category.");
    if (!product.price) return setError("Please enter the selling price.");
    if (!product.banner) return setError("Please upload a main product photo.");

    try {
      setLoading(true);
      const payload = {
        ...product,
        slug: generateSlug(product.name),
        price: Number(product.price),
        originalPrice: Number(product.originalPrice) || Number(product.price),
        stock: Number(product.stock) || 0,
        images: product.images.filter(Boolean),
        colors: product.colors.filter((c) => c.name.trim() && c.image),
      };

      if (isEditing) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }

      setSuccess(true);
      setTimeout(() => navigate("/admin/products"), 1400);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const isBusy =
    loading ||
    uploadingBanner ||
    uploadingGallery ||
    uploadingColorIdx !== null;
  const discount =
    product.price &&
    product.originalPrice &&
    Number(product.originalPrice) > Number(product.price)
      ? Math.round(
          (1 - Number(product.price) / Number(product.originalPrice)) * 100,
        )
      : 0;

  // Separate sizes into preset vs custom for display
  const presetSelected = product.sizes.filter((s) => PRESET_SIZES.includes(s));
  const customSizes = product.sizes.filter((s) => !PRESET_SIZES.includes(s));

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#2874F0]">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Loading Product…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-gray-900 md:pt-5 pb-24">
      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div
          className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3.5
          flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/products")}
              className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Fill in the details below to list it on your store
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="hidden sm:flex items-center gap-2 bg-[#FB641B] text-white
              px-7 py-2.5 rounded-sm font-bold text-sm shadow-sm
              hover:bg-[#f4511e] active:scale-95 transition-all disabled:opacity-50">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading
              ? "Saving…"
              : success
                ? "Saved!"
                : isEditing
                  ? "Save Changes"
                  : "Publish to Store"}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-7">
        {/* Banners */}
        {error && (
          <div
            className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200
            rounded-sm text-red-700 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div
            className="mb-5 flex items-center gap-3 p-4 bg-green-50 border border-green-200
            rounded-sm text-green-700 shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">
              Product {isEditing ? "updated" : "published"} successfully! Taking
              you back…
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-5">
          {/* ──────── LEFT COLUMN ──────── */}
          <div className="flex-1 space-y-5">
            {/* 1. Basic Details */}
            <Card icon={Package} title="Basic Details">
              <div>
                <FieldLabel required>Product Name</FieldLabel>
                <Input
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  placeholder="e.g. Women's Embroidered Blue Lawn Kurta"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Use a clear name that customers can search for easily.
                </p>
              </div>

              <div>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  name="description"
                  rows={4}
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Describe the fabric, fit, occasion, and wash care instructions…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Fabric / Material</FieldLabel>
                  <Input
                    name="material"
                    value={product.material}
                    onChange={handleChange}
                    placeholder="e.g. Lawn, Chiffon, Cotton"
                  />
                </div>
                <div>
                  <FieldLabel>Brand</FieldLabel>
                  <Input
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                    placeholder="e.g. Libas"
                  />
                </div>
              </div>
            </Card>

            {/* 2. Price & Stock */}
            <Card icon={DollarSign} title="Price & Stock">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <FieldLabel required>Selling Price (PKR)</FieldLabel>
                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2
                      text-gray-500 text-sm font-bold select-none">
                      ₨
                    </span>
                    <Input
                      name="price"
                      type="number"
                      min="0"
                      value={product.price}
                      onChange={handleChange}
                      placeholder="1,999"
                      className="pl-8 font-bold text-gray-900"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Price customers will pay.
                  </p>
                </div>

                <div>
                  <FieldLabel>Original Price (PKR)</FieldLabel>
                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2
                      text-gray-500 text-sm font-bold select-none">
                      ₨
                    </span>
                    <Input
                      name="originalPrice"
                      type="number"
                      min="0"
                      value={product.originalPrice}
                      onChange={handleChange}
                      placeholder="2,999"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Leave empty if no discount.
                  </p>
                </div>

                <div>
                  <FieldLabel>Stock (pieces)</FieldLabel>
                  <Input
                    name="stock"
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    How many pieces available?
                  </p>
                </div>
              </div>

              {discount > 0 && (
                <div
                  className="flex items-center gap-2.5 p-3.5 bg-green-50 border
                  border-green-200 rounded-sm text-green-800 text-sm font-bold">
                  <Sparkles size={16} className="shrink-0" />
                  Customers will see a{" "}
                  <span className="text-green-900 font-black">
                    {discount}% OFF
                  </span>{" "}
                  badge on this product!
                </div>
              )}
            </Card>

            {/* 3. Sizes — preset chips + custom input */}
            <Card icon={Ruler} title="Available Sizes">
              <p className="text-xs text-gray-500 -mt-2">
                Select standard sizes or type in custom ones (numbers, free
                size, etc.)
              </p>

              {/* Standard preset size buttons */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Standard Sizes — click to select
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SIZES.map((size) => {
                    const on = product.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => togglePresetSize(size)}
                        className={`w-14 h-14 rounded-sm text-sm font-bold border-2 transition-all
                          ${
                            on
                              ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                              : "bg-white text-gray-600 border-gray-300 hover:border-gray-600"
                          }`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ✅ Custom size input */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Add Custom Size — e.g. 38, 40, Free Size, One Size
                </p>
                <div className="flex gap-2">
                  <Input
                    ref={customSizeRef}
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    placeholder="Type a size and press Enter or click Add…"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    disabled={!customSizeInput.trim()}
                    className="flex items-center gap-1.5 px-5 py-3 bg-gray-900 text-white
                      text-sm font-bold rounded-sm hover:bg-gray-800 transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                    <Plus size={15} />
                    Add
                  </button>
                </div>
              </div>

              {/* All selected sizes shown as dismissible tags */}
              {product.sizes.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    All Selected Sizes ({product.sizes.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const isPreset = PRESET_SIZES.includes(size);
                      return (
                        <span
                          key={size}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm
                            text-sm font-bold border
                            ${
                              isPreset
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-[#2874F0] text-white border-[#2874F0]"
                            }`}>
                          {size}
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="hover:opacity-70 transition-opacity ml-0.5">
                            <X size={13} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">
                    ⬛ Black = standard size &nbsp;·&nbsp; 🔵 Blue = custom size
                  </p>
                </div>
              )}
            </Card>

            {/* 4. Colors */}
            <Card icon={Palette} title="Color Variations">
              <p className="text-xs text-gray-500 -mt-2">
                Add each color with a photo so customers can see the options.
              </p>

              <div className="space-y-3">
                {product.colors.length === 0 && (
                  <div
                    className="flex flex-col items-center justify-center py-8
                    border-2 border-dashed border-gray-200 rounded-sm text-gray-400 text-sm">
                    <Palette size={28} className="mb-2 text-gray-300" />
                    No colors added yet. Click the button below to add one.
                  </div>
                )}

                {product.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 border
                      border-gray-200 rounded-sm">
                    {/* Per-color Cloudinary upload */}
                    <label
                      className="relative w-14 h-14 shrink-0 rounded-sm border-2
                        border-dashed border-gray-300 bg-white overflow-hidden
                        flex items-center justify-center cursor-pointer
                        hover:border-[#2874F0] transition-colors group">
                      {uploadingColorIdx === idx ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#2874F0]" />
                      ) : color.image ? (
                        <>
                          <img
                            src={color.image}
                            alt={color.name}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute inset-0 bg-black/40 flex items-center
                            justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <UploadCloud className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <UploadCloud size={18} />
                          <span className="text-[9px] font-bold mt-0.5">
                            Upload
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingColorIdx !== null}
                        onChange={(e) => handleColorImageUpload(e, idx)}
                      />
                    </label>

                    <Input
                      value={color.name}
                      onChange={(e) => updateColorName(idx, e.target.value)}
                      placeholder="Color name — e.g. Navy Blue, Maroon, Off-White"
                      className="flex-1"
                    />

                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="p-2 rounded text-gray-400 hover:text-red-600
                        hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addColor}
                  className="flex items-center gap-2 text-sm font-bold text-[#2874F0]
                    px-4 py-3 border-2 border-dashed border-[#2874F0]/30 rounded-sm
                    w-full justify-center hover:bg-blue-50 hover:border-[#2874F0]/60
                    transition-all">
                  <Plus size={16} />
                  Add a Color Variation
                </button>
              </div>
            </Card>
          </div>

          {/* ──────── RIGHT SIDEBAR ──────── */}
          <div className="w-full lg:w-[370px] space-y-5">
            {/* Visibility */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-5">
              <p className="text-sm font-bold text-gray-800 mb-1">
                Store Visibility
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Control whether customers can see this product.
              </p>
              <button
                type="button"
                onClick={() =>
                  setProduct((p) => ({ ...p, isActive: !p.isActive }))
                }
                className={`w-full flex items-center justify-center gap-2.5 px-4 py-3.5
                  rounded-sm font-bold text-sm border-2 transition-all
                  ${
                    product.isActive
                      ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                      : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                  }`}>
                {product.isActive ? (
                  <>
                    <Eye size={18} /> Visible to Customers
                  </>
                ) : (
                  <>
                    <EyeOff size={18} /> Hidden (Draft)
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-400 mt-2 text-center">
                {product.isActive
                  ? "✅ Customers can search and buy this product."
                  : "🚫 Only admins can see this. Not live on store."}
              </p>
            </div>

            {/* Main Photo */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
                <ImageIcon size={15} className="text-gray-500" />
                <p className="text-sm font-bold text-gray-800">
                  Main Product Photo <span className="text-red-500">*</span>
                </p>
              </div>
              <div className="p-4">
                <label
                  className="relative flex flex-col items-center justify-center
                  w-full aspect-square border-2 border-dashed border-gray-300 rounded-sm
                  cursor-pointer bg-gray-50 hover:border-[#2874F0] hover:bg-blue-50/30
                  transition-all overflow-hidden">
                  {uploadingBanner ? (
                    <div className="flex flex-col items-center text-[#2874F0]">
                      <Loader2 className="w-9 h-9 animate-spin mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Uploading…
                      </span>
                    </div>
                  ) : product.banner ? (
                    <>
                      <img
                        src={product.banner}
                        className="w-full h-full object-cover"
                        alt="Main"
                      />
                      <div
                        className="absolute inset-0 bg-black/35 flex flex-col items-center
                        justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <UploadCloud className="w-8 h-8 text-white mb-1" />
                        <span className="text-white text-xs font-bold">
                          Change Photo
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 p-6 text-center">
                      <UploadCloud size={36} className="mb-3 text-gray-300" />
                      <span className="text-sm font-bold text-gray-700">
                        Click to upload main photo
                      </span>
                      <span className="text-xs mt-1.5 text-gray-400">
                        This is the first image customers will see
                      </span>
                      <span className="text-[10px] mt-1 text-gray-400">
                        JPG, PNG or WEBP
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                  />
                </label>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div
                className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60
                flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={15} className="text-gray-500" />
                  <p className="text-sm font-bold text-gray-800">
                    Extra Photos
                  </p>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {product.images.length} / 6
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-3">
                  Show different angles or styling of the product.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-sm overflow-hidden
                      relative group border border-gray-200">
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProduct((p) => ({
                            ...p,
                            images: p.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute inset-0 bg-black/50 flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}

                  {product.images.length < 6 && (
                    <label
                      className="aspect-square rounded-sm border-2 border-dashed
                      border-gray-300 flex flex-col items-center justify-center cursor-pointer
                      hover:border-[#2874F0] hover:bg-blue-50/30 transition-all text-gray-400">
                      {uploadingGallery ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Plus size={22} />
                          <span className="text-[10px] font-bold mt-1">
                            Add Photo
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryUpload}
                        disabled={uploadingGallery}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Category & Collection */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
                <Tag size={15} className="text-gray-500" />
                <p className="text-sm font-bold text-gray-800">
                  Category & Collection
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <FieldLabel required>Category</FieldLabel>
                  <Select
                    name="categoryId"
                    value={product.categoryId}
                    onChange={handleChange}>
                    <option value="">— Select a Category —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Which type of clothing is this?
                  </p>
                </div>

                <div>
                  <FieldLabel>Collection</FieldLabel>
                  <Select
                    name="collectionType"
                    value={product.collectionType}
                    onChange={handleChange}>
                    <option value="">— No Collection —</option>
                    {COLLECTIONS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </Select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Which season or event does this belong to?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky save */}
      <div
        className="fixed bottom-0 inset-x-0 sm:hidden bg-white border-t border-gray-200
        shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 z-50">
        <button
          onClick={handleSubmit}
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-2 bg-[#FB641B] text-white
            py-4 rounded-sm font-bold text-sm active:scale-95 transition-all
            disabled:opacity-50 shadow-md">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />{" "}
              {isEditing ? "Save Changes" : "Publish to Store"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCreatePage;
