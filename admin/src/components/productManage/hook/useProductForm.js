import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { productService } from "../../../services/firebase/product/productService";
import {
  uploadImageToCloudinary,
  uploadMultipleImages,
} from "../../../services/cloudinary/uploadImage";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const INITIAL_PRODUCT = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: "",
  banner: "",
  categoryId: "",
  collectionTypes: [],
  images: [],
  colors: [],
  sizes: [],
  material: "",
  brand: "",
  isActive: true,
};

const generateSlug = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const useProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_ADMIN_UPLOAD_PRESET;

  const [product, setProduct] = useState(INITIAL_PRODUCT);
  const [newCollection, setNewCollection] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingColorIdx, setUploadingColorIdx] = useState(null);

  const [customSizeInput, setCustomSizeInput] = useState("");
  const customSizeRef = useRef(null);

  /* ─────────────────────────────
     Load product for editing
  ───────────────────────────── */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setPageLoading(true);
        const data = await productService.getProduct(id);

        setProduct({
          ...INITIAL_PRODUCT,
          ...data,
          price: data.price?.toString() ?? "",
          originalPrice: data.originalPrice?.toString() ?? "",
          stock: data.stock?.toString() ?? "",
          images: data.images ?? [],
          colors: data.colors ?? [],
          sizes: data.sizes ?? [],
          collectionTypes: data.collectionTypes ?? [],
        });
      } catch (err) {
        setError("Could not load this product.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ─────────────────────────────
     Field change
  ───────────────────────────── */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProduct((p) => ({
      ...p,
      [name]: value,
    }));
    // Clear errors when the user starts typing again
    setError(null); 
  }, []);

  /* ─────────────────────────────
     Banner upload
  ───────────────────────────── */
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const res = await uploadImageToCloudinary(file, cloudName, uploadPreset);
      setProduct((p) => ({ ...p, banner: res.url }));
    } catch (err) {
      setError("Failed to upload banner image.");
    } finally {
      setUploadingBanner(false);
    }
  };

  /* ─────────────────────────────
     Gallery upload
  ───────────────────────────── */
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    try {
      setUploadingGallery(true);
      const res = await uploadMultipleImages(files, cloudName, uploadPreset);
      setProduct((p) => ({
        ...p,
        images: [...p.images, ...res.map((r) => r.url)],
      }));
    } catch (err) {
      setError("Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  };

  /* ─────────────────────────────
   Color Image Upload
───────────────────────────── */
const handleColorImageUpload = async (e, idx) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setUploadingColorIdx(idx);
    const res = await uploadImageToCloudinary(file, cloudName, uploadPreset);
    setProduct((p) => ({
      ...p,
      colors: p.colors.map((c, i) =>
        i === idx ? { ...c, image: res.url } : c
      ),
    }));
  } catch (err) {
    setError("Failed to upload color image.");
  } finally {
    setUploadingColorIdx(null);
  }
};
  /* ─────────────────────────────
     Colors
  ───────────────────────────── */
  const addColor = () =>
    setProduct((p) => ({ ...p, colors: [...p.colors, { name: "", image: "" }] }));

  const removeColor = (idx) =>
    setProduct((p) => ({
      ...p,
      colors: p.colors.filter((_, i) => i !== idx),
    }));

  const updateColorName = (idx, val) =>
    setProduct((p) => ({
      ...p,
      colors: p.colors.map((c, i) => (i === idx ? { ...c, name: val } : c)),
    }));

  /* ─────────────────────────────
     Sizes
  ───────────────────────────── */
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

    // Prevent duplicate sizes
    if (!product.sizes.includes(val)) {
      setProduct((p) => ({ ...p, sizes: [...p.sizes, val] }));
    }
    setCustomSizeInput("");
  };

  // ✅ NEW: removeSize function added here
  const removeSize = (sizeToRemove) => {
    setProduct((p) => ({
      ...p,
      sizes: p.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  /* ─────────────────────────────
     Submit
  ───────────────────────────── */
  const handleSubmit = async () => {
    // Basic Client-Side Validation
    if (!product.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!product.categoryId) {
      setError("Please select a category.");
      return;
    }
    if (!product.price || Number(product.price) <= 0) {
      setError("Please enter a valid selling price.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...product,
        slug: generateSlug(product.name),
        price: Number(product.price),
        originalPrice: Number(product.originalPrice) || Number(product.price),
        stock: Number(product.stock) || 0,
      };

      if (isEditing) {
        await productService.updateProduct(id, payload);
      } else {
        await productService.createProduct(payload);
      }

      setSuccess(true);
      setTimeout(() => navigate("/products"), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  };

  return {
    product,
    setProduct,
    error,
    handleColorImageUpload,
    setError,
    success,
    setSuccess,
    loading,
    pageLoading,

    handleChange,
    handleSubmit,

    uploadingBanner,
    uploadingGallery,
    uploadingColorIdx,

    handleBannerUpload,
    handleGalleryUpload,

    addColor,
    removeColor,
    updateColorName,

    togglePresetSize,
    addCustomSize,
    removeSize, // ✅ NEW: Exported here

    customSizeInput,
    setCustomSizeInput,
    customSizeRef,

    newCollection,
    setNewCollection,

    PRESET_SIZES,
    isEditing,
  };
};