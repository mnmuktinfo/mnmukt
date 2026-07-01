import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { productService } from "../../../services/firebase/product/productService";
import {
  uploadImageToCloudinary,
  uploadMultipleImages,
} from "../../../services/cloudinary/uploadImage";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const INITIAL_PRODUCT = {
  // Basic Info
  name: "",
  shortDescription: "",
  description: "",
  sku: "",
  brand: "",
  categoryId: "",
  subcategoryId: "",
  collectionTypes: [],
  tags: "",
  gender: "Unisex",
  season: "All Season",
  
  // Status
  isActive: true,
  isFeatured: false,
  isTrending: false,
  isNewArrival: false,
  isBestSeller: false,

  // Pricing & Inventory
  price: "",
  originalPrice: "",
  taxRate: "",
  stock: "",
  lowStockThreshold: "",

  // Media
  image: "", // Renamed from banner
  hoverImage: "",
  videoUrl: "",
  images: [],

  // Physical Attributes
  material: "",
  pattern: "",
  fit: "",
  sleeve: "",
  neckline: "",
  length: "",
  style: "",
  occasion: "",
  transparency: "",
  stretch: "",
  countryOfOrigin: "India",

  // Dynamic Arrays
  colors: [], // { name, image, hex }
  sizes: [],  // Currently string[], will be updated to objects in UI later if needed or kept simple
  specifications: [], // { label, value }
  highlights: [],     // { icon, title, description }
  offers: [],         // { title, description, type }

  // Shipping
  shipping: {
    codAvailable: true,
    shipsInDays: "2",
    isFreeShipping: false,
    shippingCharges: "",
    weightGm: "",
    dimensions: ""
  },

  // Policies
  policies: {
    returnPolicy: "7 Days Easy Returns",
    exchangePolicy: "7 Days Exchange",
    washCare: "Machine wash cold"
  },

  // SEO
  seo: {
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: ""
  },

  // Custom Badges
  customTags: {
    isHandmade: false,
    isOrganic: false,
    isArtisanMade: false,
    isSustainable: false,
    isLimitedEdition: false
  }
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

  const [uploadingImage, setUploadingImage] = useState(false);
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
          specifications: data.specifications ?? [],
          highlights: data.highlights ?? [],
          offers: data.offers ?? [],
          sku: data.sku ?? "",
          shipping: { ...INITIAL_PRODUCT.shipping, ...(data.shipping || {}) },
          policies: { ...INITIAL_PRODUCT.policies, ...(data.policies || {}) },
          seo: { ...INITIAL_PRODUCT.seo, ...(data.seo || {}) },
          customTags: { ...INITIAL_PRODUCT.customTags, ...(data.customTags || {}) },
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
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setProduct((p) => {
      // Support for nested paths like "seo.metaTitle"
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...p,
          [parent]: {
            ...p[parent],
            [child]: finalValue
          }
        };
      }
      return { ...p, [name]: finalValue };
    });
    setError(null);
  }, []);

  /* ─────────────────────────────
     Banner upload
  ───────────────────────────── */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploadingImage(true);
        const res = await uploadImageToCloudinary(file, cloudName, uploadPreset);
        setProduct((p) => ({ ...p, image: res.url }));
      } catch (err) {
        setError("Failed to upload primary image.");
      } finally {
        setUploadingImage(false);
      }
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
     Dynamic Arrays (Specs, Highlights, Offers)
  ───────────────────────────── */
  const addDynamicItem = (arrayName, initialObj) => {
    setProduct((p) => ({
      ...p,
      [arrayName]: [...(p[arrayName] || []), initialObj]
    }));
  };

  const updateDynamicItem = (arrayName, index, field, value) => {
    setProduct((p) => {
      const newArray = [...(p[arrayName] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...p, [arrayName]: newArray };
    });
  };

  const removeDynamicItem = (arrayName, index) => {
    setProduct((p) => ({
      ...p,
      [arrayName]: (p[arrayName] || []).filter((_, i) => i !== index)
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
    if (!product.sku.trim()) {
      setError("Product SKU is required for order tracking.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...product,
        slug: generateSlug(product.name),
        sku: product.sku.trim().toUpperCase(),
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

    uploadingImage,
    uploadingGallery,
    uploadingColorIdx,

    handleImageUpload,
    handleGalleryUpload,

    addColor,
    removeColor,
    updateColorName,

    togglePresetSize,
    addCustomSize,
    removeSize,

    addDynamicItem,
    updateDynamicItem,
    removeDynamicItem,

    customSizeInput,
    setCustomSizeInput,
    customSizeRef,

    newCollection,
    setNewCollection,

    PRESET_SIZES,
    isEditing,
  };
};