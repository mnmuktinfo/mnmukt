import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Upload,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Package,
  Grid,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Save,
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useFirebaseCollection } from "../hooks/useCollection";

import Notification from "../components/notification/Notification";

const ProductCreatePage = () => {
  const { items } = useFirebaseCollection("itemsCollection");
  console.log(items);
  const navigate = useNavigate();
  const { id } = useParams(); // Get product ID from URL for edit mode
  const {
    createProduct,
    updateProduct,
    getProduct,
    categories,
    loading,
    error,
    clearError,
  } = useProducts();

  const [product, setProduct] = useState({
    name: "",
    slug: "",
    price: "",
    originalPrice: "",
    stock: "", // Added stock field
    banner: "",
    categoryId: "",
    isActive: true,
    collectionType: "new-arrivals",
    images: [""],
    colors: [{ name: "", image: "" }],
    sizes: [""],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ type, message, duration });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Load product data if in edit mode
  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const loadProductData = async () => {
    try {
      const productData = await getProduct(id);
      if (productData) {
        setIsEditing(true);
        setProduct({
          name: productData.name || "",
          slug: productData.slug || "",
          price: productData.price?.toString() || "",
          originalPrice: productData.originalPrice?.toString() || "",
          stock: productData.stock?.toString() || "", // Added stock
          banner: productData.banner || "",
          categoryId: productData.categoryId || "",
          isActive:
            productData.isActive !== undefined ? productData.isActive : true,
          collectionType: productData.collectionType || "new-arrivals",
          images:
            Array.isArray(productData.images) && productData.images.length > 0
              ? productData.images
              : [""],
          colors:
            Array.isArray(productData.colors) && productData.colors.length > 0
              ? productData.colors
              : [{ name: "", image: "" }],
          sizes:
            Array.isArray(productData.sizes) && productData.sizes.length > 0
              ? productData.sizes
              : [""],
        });
      }
    } catch (err) {
      showNotification("error", "Failed to load product data");
      console.error("Error loading product:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));

    if (error) clearError();
    if (notification) hideNotification();
  };

  const handleArrayChange = (field, index, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleObjectArrayChange = (field, index, subField, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [subField]: value } : item,
      ),
    }));
  };

  const addArrayField = (field, defaultValue = "") => {
    setProduct((prev) => ({
      ...prev,
      [field]: [...prev[field], defaultValue],
    }));
  };

  const removeArrayField = (field, index) => {
    setProduct((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const validateForm = () => {
    if (!product.name.trim()) {
      return "Product name is required";
    }
    if (!product.banner.trim()) {
      return "Banner image URL is required";
    }
    if (!product.categoryId) {
      return "Please select a category";
    }
    if (!product.price) {
      return "Price is required";
    }

    // Validate images
    const validImages = product.images.filter((img) => img.trim() !== "");
    if (validImages.length === 0) {
      return "At least one product image is required";
    }

    // Validate URLs
    const allUrls = [
      product.banner,
      ...product.images,
      ...product.colors.map((c) => c.image),
    ];
    for (const url of allUrls) {
      if (url && url.trim() !== "" && !isValidUrl(url)) {
        return "Please enter valid image URLs";
      }
    }

    return null;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showNotification("error", validationError);
      return;
    }

    try {
      // Filter out empty values from arrays
      const productData = {
        ...product,
        slug: product.slug || generateSlug(product.name),
        price: Number(product.price),
        originalPrice: Number(product.originalPrice) || Number(product.price),
        stock: Number(product.stock) || 0, // Added stock conversion
        images: product.images.filter((img) => img.trim() !== ""),
        colors: product.colors.filter(
          (color) => color.name.trim() !== "" && color.image.trim() !== "",
        ),
        sizes: product.sizes.filter((size) => size.trim() !== ""),
      };

      if (isEditing) {
        // Update existing product
        await updateProduct(id, productData);
        showNotification("success", "Product updated successfully! 🎉", 3000);
      } else {
        // Create new product
        await createProduct(productData);
        showNotification("success", "Product created successfully! 🎉", 3000);
      }

      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      showNotification(
        "error",
        err.message || `Failed to ${isEditing ? "update" : "create"} product`,
      );
    }
  };

  return (
    <div className="min-h-screen  pt-16">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Products
          </button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {isEditing ? "Edit Product" : "Create New Product"}
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {isEditing
                ? "Update product details, images, and pricing"
                : "Add a new product with images, pricing, and category details"}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className=" p-8  transition-shadow duration-300">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="group">
                <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                  <Package className="w-5 h-5 text-[#B4292F]" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Slug */}
              <div className="group">
                <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                  <Tag className="w-5 h-5 text-[#B4292F]" />
                  Product Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={product.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="auto-generated-slug"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Leave empty to auto-generate from name
                </p>
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="group">
              <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <Package className="w-5 h-5 text-[#B4292F]" />
                Stock Quantity
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  name="stock"
                  value={product.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                  placeholder="100"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Current available quantity in inventory
              </p>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Price */}
              <div className="group">
                <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                  <DollarSign className="w-5 h-5 text-[#B4292F]" />
                  Selling Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                    placeholder="2499.00"
                    required
                  />
                </div>
              </div>

              {/* Original Price */}
              <div className="group">
                <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                  <DollarSign className="w-5 h-5 text-[#B4292F]" />
                  Original Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="originalPrice"
                    value={product.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                    placeholder="3499.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Leave empty to use selling price
                </p>
              </div>
            </div>

            {/* Category and Collection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Selection */}
              <div className="group">
                <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                  <Grid className="w-5 h-5 text-[#B4292F]" />
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={product.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                  required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Collection Type */}
              <div className="group">
                <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                  <ToggleRight className="w-5 h-5 text-[#B4292F]" />
                  Collection Type
                </label>
                <select
                  name="collectionType"
                  value={product.collectionType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))
                  ) : (
                    <option value="new-arrivals">New Arrivals</option>
                  )}
                  {/* Optional static defaults */}
                  <option value="basics">Basics</option>
                </select>
              </div>
            </div>

            {/* Active Status */}
            <div className="group">
              <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                Status
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setProduct((prev) => ({ ...prev, isActive: true }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    product.isActive
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                  {product.isActive ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                  Active
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProduct((prev) => ({ ...prev, isActive: false }))
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    !product.isActive
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                  {!product.isActive ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                  Inactive
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Active products will be visible to customers
              </p>
            </div>

            {/* Banner Image */}
            <div className="group">
              <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <ImageIcon className="w-5 h-5 text-[#B4292F]" />
                Banner Image URL *
              </label>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="url"
                      name="banner"
                      value={product.banner}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                      placeholder="https://example.com/banner-image.jpg"
                      required
                    />
                    <Upload className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>
                {product.banner && (
                  <div className="lg:w-48">
                    <div className="bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300">
                      <p className="text-sm text-gray-600 mb-3 text-center">
                        Banner Preview
                      </p>
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-white">
                        <img
                          src={product.banner}
                          className="w-full h-full object-cover"
                          alt="Banner preview"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%239ca3af'%3EInvalid URL%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Images */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 font-semibold text-gray-900">
                  <ImageIcon className="w-5 h-5 text-[#B4292F]" />
                  Product Images *
                </label>
                <button
                  type="button"
                  onClick={() => addArrayField("images")}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-[#B4292F] text-white rounded-lg hover:bg-[#9c2227] transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
              </div>

              <div className="space-y-3">
                {product.images.map((image, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1 relative">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) =>
                          handleArrayChange("images", index, e.target.value)
                        }
                        className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-[#B4292F] focus:ring-2 focus:ring-[#B4292F]/20 transition-all duration-200"
                        placeholder="https://example.com/product-image.jpg"
                      />
                      <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    {product.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("images", index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Add multiple images for the product gallery
              </p>
            </div>

            {/* Colors */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 font-semibold text-gray-900">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-pink-600" />
                  Colors
                </label>
                <button
                  type="button"
                  onClick={() =>
                    addArrayField("colors", { name: "", image: "" })
                  }
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-[#B4292F] text-white rounded-lg hover:bg-[#9c2227] transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Color
                </button>
              </div>

              <div className="space-y-4">
                {product.colors.map((color, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-4 border-2 border-gray-100 rounded-xl">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Color Name
                      </label>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) =>
                          handleObjectArrayChange(
                            "colors",
                            index,
                            "name",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#B4292F] focus:ring-1 focus:ring-[#B4292F]/20"
                        placeholder="e.g., Blush Pink"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Color Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={color.image}
                          onChange={(e) =>
                            handleObjectArrayChange(
                              "colors",
                              index,
                              "image",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-[#B4292F] focus:ring-1 focus:ring-[#B4292F]/20"
                          placeholder="https://example.com/color-swatch.jpg"
                        />
                        {product.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField("colors", index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="group">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 font-semibold text-gray-900">
                  <Package className="w-5 h-5 text-[#B4292F]" />
                  Sizes
                </label>
                <button
                  type="button"
                  onClick={() => addArrayField("sizes")}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-[#B4292F] text-white rounded-lg hover:bg-[#9c2227] transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Size
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) =>
                        handleArrayChange("sizes", index, e.target.value)
                      }
                      className="bg-transparent border-none focus:ring-0 w-16"
                      placeholder="e.g., S"
                    />
                    {product.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("sizes", index)}
                        className="text-red-600 hover:text-red-800 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200 border-2 border-transparent hover:border-gray-300">
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-[#B4292F] text-white rounded-xl font-semibold hover:bg-[#9c2227] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Save className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {isEditing ? "Update Product" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Panel */}
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

export default ProductCreatePage;
