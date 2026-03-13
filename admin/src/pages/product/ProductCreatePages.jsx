import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

import { CATEGORIES } from "../../constants/categories";
import { COLLECTIONS } from "../../constants/collections";

import { useProductForm } from "../../components/productManage/hook/useProductForm";

import ProductInfoCard from "../../components/productManage/createProduct/productForm/ProductInfoCard";
import PriceInventoryCard from "../../components/productManage/createProduct/productForm/PriceInventoryCard";
import SizesCard from "../../components/productManage/createProduct/productForm/SizesCard";
import ColourCard from "../../components/productManage/createProduct/productForm/ColourCard";
import ProductImageCard from "../../components/productManage/createProduct/productForm/ProductImageCard";
import ProductGalleryCard from "../../components/productManage/createProduct/productForm/ProductGalleryCard";
import ProductOrganizationCard from "../../components/productManage/createProduct/productForm/ProductOrganizationCard";
import ProductStatusCard from "../../components/productManage/createProduct/productForm/ProductStatusCard";

import MobileStickySaveButton from "../../components/productManage/createProduct/ui/MobileStickySaveButton";

const ProductCreatePage = () => {
  const navigate = useNavigate();

  const {
    product,
    setProduct,
    error,
    setError,
    success,
    loading,
    pageLoading,

    handleChange,
    handleSubmit,

    uploadingBanner,
    uploadingGallery,
    uploadingColorIdx,

    addColor,
    updateColorName,

    togglePresetSize,
    addCustomSize,

    customSizeInput,
    setCustomSizeInput,
    customSizeRef,

    PRESET_SIZES,
    isEditing,

    newCollection,
    setNewCollection,
    removeColor,
    removeSize,
    handleColorImageUpload,
    handleGalleryUpload,
    handleBannerUpload,
  } = useProductForm();

  const isBusy =
    loading ||
    uploadingBanner ||
    uploadingGallery ||
    uploadingColorIdx !== null;

  // Calculate discount percentage safely
  const discount =
    product.price &&
    product.originalPrice &&
    Number(product.originalPrice) > Number(product.price)
      ? Math.round(
          (1 - Number(product.price) / Number(product.originalPrice)) * 100,
        )
      : 0;

  // Initial Page Load State
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F6] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#2874F0]" />
        <p className="text-[#878787] font-medium">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-[#212121] pb-24">
      {/* STICKY HEADER - Flipkart Style */}
      <div className="bg-white border-b border-[#e0e0e0] sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/products")}
              className="p-2 rounded-sm hover:bg-[#f1f3f6] text-[#878787] hover:text-[#212121] transition-colors"
              title="Back to Products">
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-[20px] font-semibold text-[#212121] leading-tight">
                {isEditing ? "Edit Product Listing" : "Add New Product"}
              </h1>
              <p className="text-[#878787] text-[13px] hidden sm:block mt-0.5">
                {isEditing
                  ? `Editing ID: ${product.id || "N/A"}`
                  : "Fill in the details below to publish."}
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="hidden sm:flex items-center justify-center gap-2 bg-[#2874F0] text-white px-8 py-2.5 rounded-sm font-medium text-[15px] shadow-sm hover:bg-[#1d5ed8] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed min-w-[200px]">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}

            <span>
              {loading
                ? "Saving Changes..."
                : success
                  ? "Saved Successfully!"
                  : isEditing
                    ? "Save Changes"
                    : "Publish Product"}
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-[#ffebee] border border-[#ffcdd2] rounded-sm text-[#c62828] shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[14px] font-medium flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-[#e57373] hover:text-[#c62828] transition-colors"
              title="Dismiss">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SUCCESS BANNER */}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-[#f2f8f5] border border-[#388e3c] rounded-sm text-[#388e3c] shadow-sm animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-[14px] font-medium">
              Product {isEditing ? "updated" : "published"} successfully!
              Redirecting...
            </p>
          </div>
        )}

        {/* 2-COLUMN GRID LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN - Primary Content */}
          <div className="flex-1 space-y-6">
            <ProductInfoCard product={product} handleChange={handleChange} />

            <PriceInventoryCard
              product={product}
              handleChange={handleChange}
              discount={discount}
            />

            <SizesCard
              product={product}
              togglePresetSize={togglePresetSize}
              addCustomSize={addCustomSize}
              PRESET_SIZES={PRESET_SIZES}
              customSizeInput={customSizeInput}
              setCustomSizeInput={setCustomSizeInput}
              customSizeRef={customSizeRef}
              removeSize={removeSize}
            />

            <ColourCard
              product={product}
              addColor={addColor}
              updateColorName={updateColorName}
              uploadingColorIdx={uploadingColorIdx}
              removeColor={removeColor}
              handleColorImageUpload={handleColorImageUpload}
            />
          </div>

          {/* RIGHT COLUMN - Meta & Media */}
          <div className="w-full lg:w-100 space-y-6">
            <ProductStatusCard product={product} setProduct={setProduct} />

            <ProductOrganizationCard
              product={product}
              setProduct={setProduct}
              handleChange={handleChange}
              newCollection={newCollection}
              setNewCollection={setNewCollection}
              CATEGORIES={CATEGORIES}
              COLLECTIONS={COLLECTIONS}
            />

            <ProductImageCard
              product={product}
              uploadingBanner={uploadingBanner}
              handleBannerUpload={handleBannerUpload}
            />

            <ProductGalleryCard
              product={product}
              setProduct={setProduct}
              uploadingGallery={uploadingGallery}
              handleGalleryUpload={handleGalleryUpload}
            />
          </div>
        </div>
      </div>

      {/* MOBILE STICKY FOOTER */}
      <MobileStickySaveButton
        handleSubmit={handleSubmit}
        isBusy={isBusy}
        isEditing={isEditing}
        loading={loading}
        success={success}
      />
    </div>
  );
};

export default ProductCreatePage;
