import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  BotMessageSquare,
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
import ProductSpecsHighlightsCard from "../../components/productManage/createProduct/productForm/ProductSpecsHighlightsCard";
import ProductSEOCard from "../../components/productManage/createProduct/productForm/ProductSEOCard";
// 👈 REMOVED: ProductAttributesCard (pattern/fit/sleeve/neckline/length/occasion —
// none of these fields exist on the hook's product state anymore) and
// VariantStockCard (variantList / updateVariantStock don't exist on the hook —
// there's no per-variant stock tracking, just a flat `stock` number).

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

    uploadingImage,
    uploadingGallery,
    uploadingColorIdx,

    addColor,
    updateColorName,
    updateColorHex,

    togglePresetSize,
    addCustomSize,
    removeSize,

    addDynamicItem,
    updateDynamicItem,
    removeDynamicItem,

    customSizeInput,
    setCustomSizeInput,
    customSizeRef,

    PRESET_SIZES,
    isEditing,

    newCollection,
    setNewCollection,
    removeColor,
    handleColorImageUpload,
    handleGalleryUpload,
    handleImageUpload,
  } = useProductForm();

  const isBusy =
    loading || uploadingImage || uploadingGallery || uploadingColorIdx !== null;

  // ─── CHATGPT HTML DESCRIPTION GENERATOR ──────────────────────────
  const handleChatGPTRedirect = () => {
    const contextLines = [];
    if (product.name) contextLines.push(`Product Name: ${product.name}`);
    if (product.brand) contextLines.push(`Brand: ${product.brand}`);
    if (product.categoryId)
      contextLines.push(`Category: ${product.categoryId}`);
    if (product.shortDescription)
      contextLines.push(`Short Description: ${product.shortDescription}`);

    // 👈 FIXED: `tags` is a plain string on the hook ("tags: ''" in
    // INITIAL_PRODUCT, edited via a single text input), not an array.
    // Calling .join() on it would throw. Split on commas instead.
    if (product.tags?.trim()) {
      const tagList = product.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length)
        contextLines.push(`Tags/Keywords: ${tagList.join(", ")}`);
    }

    if (product.highlights?.length) {
      const hStr = product.highlights
        .filter((h) => h.title && h.value)
        .map((h) => `${h.title}: ${h.value}`)
        .join(", ");
      if (hStr) contextLines.push(`Highlights: ${hStr}`);
    }

    const basePrompt = `You are an expert fashion e-commerce copywriter.

IMPORTANT:
Before writing the HTML description, first ask me a few questions if any information is missing.

Example:
1. What components are included?
   - Kurta
   - Pants
   - Dupatta
   - Jacket
   - Blouse
   - Saree
   - Sharara
   - Gharara
   - Palazzo
   - Skirt
   - Other

2. Which sections should be included?
   Example:
   - Kurta
   - Pants
   - Dupatta

3. Do you have fabric details for each item?

4. Any embroidery, prints, lining, pockets, sleeves, neckline, closure, fit, wash care, or special features?

Only after I answer these questions, generate the final HTML.

---------------------------------------------------

The final HTML must exactly follow this clean premium layout.

<h2>Key Features:</h2>

<ul>
<li><strong>Fabric:</strong> ...</li>
<li><strong>Color:</strong> ...</li>
<li><strong>Silhouette:</strong> ...</li>
</ul>

<h2>Kurta:</h2>

<ul>
<li>...</li>
<li>...</li>
<li>...</li>
</ul>

<h2>Pants:</h2>

<ul>
<li>...</li>
<li>...</li>
</ul>

<h2>Dupatta:</h2>

<ul>
<li>...</li>
<li>...</li>
</ul>

<h2>Care Instructions:</h2>

<ul>
<li>Dry Clean Recommended</li>
<li>Steam Iron if Needed</li>
<li>Store in a Cool Dry Place</li>
</ul>

Rules:

• Use only clean HTML.
• No markdown.
• No inline CSS.
• No tables.
• Use only:
  - <h2>
  - <p>
  - <ul>
  - <li>
  - <strong>

The design should visually match premium fashion websites exactly like this format:

Key Features

• Fabric:
• Color:
• Silhouette:

Kurta

• Neckline
• Sleeves
• Fit
• Embroidery
• Lining
• Length

Pants

• Waist
• Closure
• Pocket
• Fabric
• Length

Dupatta

• Fabric
• Border
• Size

If any section doesn't exist, omit it completely.

Use the following product data:

${contextLines.join("\n")}

Wait for my answers before generating the HTML.`;

    const encodedPrompt = encodeURIComponent(basePrompt);
    window.open(`https://chatgpt.com/?q=${encodedPrompt}`, "_blank");
  };

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
      {/* ─── STICKY HEADER ────────────────────────────────────────────────── */}
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

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* ACTION BANNER: ChatGPT HTML Generator */}
        <div className="mb-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-sm shadow-sm animate-in fade-in">
          <div className="flex flex-col">
            <h3 className="text-[14px] font-semibold text-[#2874F0] flex items-center gap-2">
              <BotMessageSquare className="w-5 h-5" />
              Need an HTML Description?
            </h3>
            <p className="text-[13px] text-gray-600 mt-1">
              Fill out the basic info below, then click here to auto-generate a
              stunning HTML layout for your Long Description via ChatGPT.
            </p>
          </div>
          <button
            onClick={handleChatGPTRedirect}
            type="button"
            className="bg-white border border-[#2874F0] text-[#2874F0] px-4 py-2 rounded text-[13px] font-medium hover:bg-[#2874F0] hover:text-white transition-colors">
            Generate with ChatGPT
          </button>
        </div>

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

            <PriceInventoryCard product={product} handleChange={handleChange} />

            <ProductSpecsHighlightsCard
              product={product}
              addDynamicItem={addDynamicItem}
              updateDynamicItem={updateDynamicItem}
              removeDynamicItem={removeDynamicItem}
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
              updateColorHex={updateColorHex}
              uploadingColorIdx={uploadingColorIdx}
              removeColor={removeColor}
              handleColorImageUpload={handleColorImageUpload}
            />
          </div>

          {/* RIGHT COLUMN - Meta & Media */}
          <div className="w-full lg:w-100 space-y-6 lg:max-w-[380px]">
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

            <ProductSEOCard product={product} handleChange={handleChange} />

            <ProductImageCard
              product={product}
              uploadingImage={uploadingImage}
              handleImageUpload={handleImageUpload}
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
