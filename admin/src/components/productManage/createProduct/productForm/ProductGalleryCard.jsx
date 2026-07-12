import { ImageIcon, Loader2, Plus, Trash2, Info } from "lucide-react";
import React from "react";

// 👈 FIXED: was reading `product.images?.gallery` as an array of
// { id, url, alt } objects. The hook's INITIAL_PRODUCT has a flat
// `images: []` array of plain URL strings, appended to directly by
// handleGalleryUpload via setProduct(p => ({...p, images: [...p.images, ...urls]})).
const ProductGalleryCard = ({
  product,
  setProduct,
  handleGalleryUpload,
  uploadingGallery,
}) => {
  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ImageIcon size={18} className="text-[#2874F0]" />
          <h2 className="text-base font-medium text-[#212121]">
            Gallery Images
          </h2>
        </div>
        <span className="text-[12px] font-medium text-[#878787] bg-[#f1f3f6] px-2.5 py-1 rounded-sm">
          {images.length} / 6
        </span>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start gap-2 text-[12px] text-[#878787] bg-[#f1f3f6] p-2.5 rounded-sm border border-[#e0e0e0]">
          <Info size={14} className="shrink-0 text-[#2874F0] mt-0.5" />
          <p>
            These images will appear in the carousel on the{" "}
            <span className="font-medium text-[#212121]">
              Product Details Page (PDP)
            </span>
            . Dragging to reorder is not supported in this version.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className="aspect-square rounded-sm overflow-hidden relative group border border-gray-200">
              <img
                src={url}
                className="w-full h-full object-cover"
                alt={`Gallery ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() =>
                  setProduct((p) => ({
                    ...p,
                    images: (p.images || []).filter((_, i) => i !== idx),
                  }))
                }
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove Image">
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}

          {images.length < 6 && (
            <label className="aspect-square rounded-sm border border-dashed border-[#d7d7d7] bg-[#f1f3f6] flex flex-col items-center justify-center cursor-pointer hover:border-[#2874F0] transition-colors text-[#878787]">
              {uploadingGallery ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#2874F0]" />
              ) : (
                <>
                  <Plus size={24} className="mb-1" />
                  <span className="text-[11px] font-medium">Add Image</span>
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
  );
};

export default ProductGalleryCard;
