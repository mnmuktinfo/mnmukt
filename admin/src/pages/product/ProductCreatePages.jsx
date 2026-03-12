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
  FolderTree,
} from "lucide-react";

import { CATEGORIES } from "../../constants/categories";
import { COLLECTIONS } from "../../constants/collections";
import { productService } from "../../services/firebase/product/productService";
import {
  uploadImageToCloudinary,
  uploadMultipleImages,
} from "../../services/cloudinary/uploadImage";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Premium Reusable UI (Seller Hub Style) ───────────────────────────────────

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-4 py-2.5 border border-gray-300 rounded-sm text-[15px]
      text-[#212121] placeholder:text-[#878787] bg-white outline-none
      focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20
      transition-all disabled:bg-[#f9fafb] disabled:text-gray-500 ${className}`}
    {...props}
  />
));

const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-4 py-3 border border-gray-300 rounded-sm text-[15px]
      text-[#212121] placeholder:text-[#878787] bg-white outline-none resize-none
      focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all
      ${className}`}
    {...props}
  />
);

const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full px-4 py-2.5 border border-gray-300 rounded-sm text-[15px]
      text-[#212121] bg-white outline-none cursor-pointer
      focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 transition-all
      ${className}`}
    {...props}>
    {children}
  </select>
);

const FieldLabel = ({ children, required, subtitle }) => (
  <div className="mb-1.5">
    <label className="block text-sm font-medium text-[#212121]">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {subtitle && (
      <p className="text-[12px] text-[#878787] mt-0.5">{subtitle}</p>
    )}
  </div>
);

const Card = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-white">
      {Icon && <Icon size={18} className="text-[#2874F0] shrink-0" />}
      <h2 className="text-base font-medium text-[#212121]">{title}</h2>
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const cloudName = import.meta.env.VITE_CLOUDINARY_COLLECTION;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_ADMIN_UPLOAD_PRESET;

  const [product, setProduct] = useState(INITIAL_PRODUCT);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingColorIdx, setUploadingColorIdx] = useState(null);

  const [customSizeInput, setCustomSizeInput] = useState("");
  const customSizeRef = useRef(null);

  // ── Load for editing ──
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

  // ── Field change ──
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setError(null);
    setProduct((p) => ({ ...p, [name]: value }));
  }, []);

  // ── Image uploads ──
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

  // ── Colors CRUD ──
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

  // ── Size helpers ──
  const togglePresetSize = (size) =>
    setProduct((p) => ({
      ...p,
      sizes: p.sizes.includes(size)
        ? p.sizes.filter((s) => s !== size)
        : [...p.sizes, size],
    }));

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

  const removeSize = (size) =>
    setProduct((p) => ({ ...p, sizes: p.sizes.filter((s) => s !== size) }));

  // ── Submit ──
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
      setTimeout(() => navigate("/products"), 1400);
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

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#2874F0]">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-[#212121] mt-5 pb-24">
      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/products")}
              className="p-2 rounded-sm hover:bg-gray-100 text-gray-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-[18px] font-medium text-[#212121] leading-tight">
                {isEditing ? "Edit Product Listing" : "Add New Product"}
              </h1>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="hidden sm:flex items-center gap-2 bg-[#2874F0] text-white
              px-8 py-2.5 rounded-sm font-medium text-[15px] shadow-sm
              hover:bg-[#1c5fba] active:scale-95 transition-all disabled:opacity-60 min-w-[160px] justify-center">
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
                ? "Saved Successfully!"
                : isEditing
                  ? "Save Changes"
                  : "Publish Product"}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-[#ffebee] border border-[#ffcdd2] rounded-sm text-[#c62828] shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[15px] font-medium flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-[#e57373] hover:text-[#c62828]">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-[#e8f5e9] border border-[#c8e6c9] rounded-sm text-[#2e7d32] shadow-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-[15px] font-medium">
              Product {isEditing ? "updated" : "published"} successfully!
              Redirecting...
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ──────── LEFT COLUMN ──────── */}
          <div className="flex-1 space-y-6">
            {/* 1. Basic Details */}
            <Card icon={Package} title="Product Information">
              <div>
                <FieldLabel required subtitle="Use a clear, descriptive name.">
                  Product Name
                </FieldLabel>
                <Input
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  placeholder="e.g. Men's Solid Formal Cotton Shirt"
                />
              </div>

              <div>
                <FieldLabel subtitle="Provide details about fit, fabric, and care instructions.">
                  Description
                </FieldLabel>
                <Textarea
                  name="description"
                  rows={4}
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Enter detailed product description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>Fabric / Material</FieldLabel>
                  <Input
                    name="material"
                    value={product.material}
                    onChange={handleChange}
                    placeholder="e.g. 100% Cotton"
                  />
                </div>
                <div>
                  <FieldLabel>Brand Name</FieldLabel>
                  <Input
                    name="brand"
                    value={product.brand}
                    onChange={handleChange}
                    placeholder="e.g. Generic, Nike, Levi's"
                  />
                </div>
              </div>
            </Card>

            {/* 2. Price & Stock */}
            <Card icon={DollarSign} title="Pricing & Inventory">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <FieldLabel required subtitle="Final price for the customer.">
                    Selling Price (PKR)
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787] font-medium">
                      ₨
                    </span>
                    <Input
                      name="price"
                      type="number"
                      min="0"
                      value={product.price}
                      onChange={handleChange}
                      placeholder="1999"
                      className="pl-8 font-medium text-[#212121]"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel subtitle="Leave blank if no discount.">
                    MRP / Original Price (PKR)
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787] font-medium">
                      ₨
                    </span>
                    <Input
                      name="originalPrice"
                      type="number"
                      min="0"
                      value={product.originalPrice}
                      onChange={handleChange}
                      placeholder="2999"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel subtitle="Total units available.">
                    Stock Quantity
                  </FieldLabel>
                  <Input
                    name="stock"
                    type="number"
                    min="0"
                    value={product.stock}
                    onChange={handleChange}
                    placeholder="50"
                  />
                </div>
              </div>

              {discount > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[#e8f5e9] border border-[#c8e6c9] rounded-sm text-[#2e7d32] text-[15px] font-medium">
                  <Sparkles size={18} />
                  Buyers will see a{" "}
                  <span className="font-bold">{discount}% OFF</span> discount
                  tag.
                </div>
              )}
            </Card>

            {/* 3. Sizes */}
            <Card icon={Ruler} title="Sizes & Variants">
              {/* Preset Sizes */}
              <div>
                <p className="text-[13px] font-medium text-[#878787] mb-2">
                  Standard Sizes
                </p>
                <div className="flex flex-wrap gap-3">
                  {PRESET_SIZES.map((size) => {
                    const on = product.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => togglePresetSize(size)}
                        className={`min-w-[50px] h-[40px] px-3 rounded-sm text-[14px] font-medium border transition-colors
                          ${
                            on
                              ? "bg-[#2874F0] text-white border-[#2874F0]"
                              : "bg-white text-[#212121] border-[#d7d7d7] hover:border-[#2874F0] hover:text-[#2874F0]"
                          }`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Sizes */}
              <div className="pt-2">
                <p className="text-[13px] font-medium text-[#878787] mb-2">
                  Custom Size (e.g. 38, 40, Free Size)
                </p>
                <div className="flex gap-3">
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
                    placeholder="Enter custom size..."
                    className="max-w-[250px]"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    disabled={!customSizeInput.trim()}
                    className="px-6 py-2 bg-white border border-[#d7d7d7] text-[#212121] text-sm font-medium rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                    Add Size
                  </button>
                </div>
              </div>

              {/* Selected Sizes Display */}
              {product.sizes.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[13px] font-medium text-[#878787] mb-3">
                    Selected Sizes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f3f6] border border-[#e0e0e0] rounded-sm text-[14px] text-[#212121] font-medium">
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="text-[#878787] hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* 4. Colors */}
            <Card icon={Palette} title="Color Options">
              <p className="text-[13px] text-[#878787] mb-4 -mt-2">
                Upload a specific image for each color variant you offer.
              </p>

              <div className="space-y-4">
                {product.colors.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-300 rounded-sm text-[#878787] bg-gray-50/50">
                    <Palette size={32} className="mb-3 text-gray-400" />
                    <p className="text-[14px] font-medium">
                      No color options added yet.
                    </p>
                  </div>
                )}

                {product.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-sm bg-white shadow-sm">
                    {/* Color Image Upload */}
                    <label className="relative w-16 h-16 shrink-0 rounded-sm border border-gray-300 bg-[#f1f3f6] overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#2874F0] transition-colors group">
                      {uploadingColorIdx === idx ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#2874F0]" />
                      ) : color.image ? (
                        <>
                          <img
                            src={color.image}
                            alt={color.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <UploadCloud className="w-5 h-5 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-[#878787]">
                          <UploadCloud size={20} />
                          <span className="text-[10px] font-medium mt-1">
                            Image
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

                    {/* Color Name */}
                    <Input
                      value={color.name}
                      onChange={(e) => updateColorName(idx, e.target.value)}
                      placeholder="Color Name (e.g. Navy Blue)"
                      className="flex-1"
                    />

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="p-2.5 text-[#878787] hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors border border-transparent hover:border-red-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addColor}
                  className="flex items-center gap-2 text-[14px] font-medium text-[#2874F0] px-5 py-3 border border-dashed border-[#2874F0]/40 rounded-sm w-full justify-center hover:bg-blue-50 transition-colors">
                  <Plus size={18} />
                  Add New Color Variant
                </button>
              </div>
            </Card>
          </div>

          {/* ──────── RIGHT SIDEBAR ──────── */}
          <div className="w-full lg:w-[400px] space-y-6">
            {/* Visibility Settings */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] p-6">
              <h3 className="text-base font-medium text-[#212121] mb-1">
                Status
              </h3>
              <p className="text-[13px] text-[#878787] mb-5">
                Control product visibility on your storefront.
              </p>

              <button
                type="button"
                onClick={() =>
                  setProduct((p) => ({ ...p, isActive: !p.isActive }))
                }
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-sm border font-medium text-[15px] transition-all
                  ${
                    product.isActive
                      ? "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]"
                      : "bg-[#f1f3f6] text-[#878787] border-[#d7d7d7] hover:bg-[#e0e0e0]"
                  }`}>
                <div className="flex items-center gap-3">
                  {product.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
                  <span>
                    {product.isActive
                      ? "Active (Visible)"
                      : "Inactive (Hidden)"}
                  </span>
                </div>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${product.isActive ? "bg-[#2e7d32]" : "bg-[#d7d7d7]"}`}>
                  <div
                    className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white transition-all ${product.isActive ? "right-0.5" : "left-0.5"}`}></div>
                </div>
              </button>
            </div>

            {/* Organization */}
            <Card icon={FolderTree} title="Organization">
              <div className="space-y-5">
                <div>
                  <FieldLabel required>Category</FieldLabel>
                  <Select
                    name="categoryId"
                    value={product.categoryId}
                    onChange={handleChange}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <FieldLabel>
                    Collection{" "}
                    <span className="text-[#878787] font-normal text-[13px]">
                      (Optional)
                    </span>
                  </FieldLabel>
                  <Select
                    name="collectionType"
                    value={product.collectionType}
                    onChange={handleChange}>
                    <option value="">None</option>
                    {COLLECTIONS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>

            {/* Main Product Image */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
                <ImageIcon size={18} className="text-[#2874F0]" />
                <h2 className="text-base font-medium text-[#212121]">
                  Primary Image <span className="text-red-500">*</span>
                </h2>
              </div>
              <div className="p-6">
                <label className="relative flex flex-col items-center justify-center w-full aspect-square border border-dashed border-[#d7d7d7] rounded-sm cursor-pointer bg-[#f1f3f6] hover:border-[#2874F0] hover:bg-blue-50/30 transition-all overflow-hidden group">
                  {uploadingBanner ? (
                    <div className="flex flex-col items-center text-[#2874F0]">
                      <Loader2 className="w-8 h-8 animate-spin mb-3" />
                      <span className="text-[13px] font-medium">
                        Uploading image...
                      </span>
                    </div>
                  ) : product.banner ? (
                    <>
                      <img
                        src={product.banner}
                        className="w-full h-full object-cover"
                        alt="Main"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloud className="w-8 h-8 text-white mb-2" />
                        <span className="text-white text-[14px] font-medium">
                          Change Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-3">
                        <ImageIcon size={20} className="text-[#2874F0]" />
                      </div>
                      <span className="text-[14px] font-medium text-[#212121]">
                        Add Primary Image
                      </span>
                      <span className="text-[12px] text-[#878787] mt-1 px-4">
                        This will be the main thumbnail. 500x500px recommended.
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

            {/* Additional Images (Gallery) */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ImageIcon size={18} className="text-[#2874F0]" />
                  <h2 className="text-base font-medium text-[#212121]">
                    Gallery Images
                  </h2>
                </div>
                <span className="text-[12px] font-medium text-[#878787] bg-[#f1f3f6] px-2.5 py-1 rounded-sm">
                  {product.images.length} / 6
                </span>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-sm overflow-hidden relative group border border-gray-200">
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
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}

                  {product.images.length < 6 && (
                    <label className="aspect-square rounded-sm border border-dashed border-[#d7d7d7] bg-[#f1f3f6] flex flex-col items-center justify-center cursor-pointer hover:border-[#2874F0] transition-colors text-[#878787]">
                      {uploadingGallery ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#2874F0]" />
                      ) : (
                        <>
                          <Plus size={24} className="mb-1" />
                          <span className="text-[11px] font-medium">
                            Add Image
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
          </div>
        </div>
      </div>

      {/* Mobile Sticky Save Button */}
      <div className="fixed bottom-0 inset-x-0 sm:hidden bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 z-50">
        <button
          onClick={handleSubmit}
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-2 bg-[#2874F0] text-white py-3.5 rounded-sm font-medium text-[15px] active:scale-95 transition-all disabled:opacity-60 shadow-sm">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving…
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />{" "}
              {isEditing ? "Save Changes" : "Publish Product"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCreatePage;
