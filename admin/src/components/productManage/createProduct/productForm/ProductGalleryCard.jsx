import { ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import React from "react";

const ProductGalleryCard = ({
  product,
  setProduct,
  handleGalleryUpload,
  uploadingGallery,
}) => {
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
          {product.images.length} / 6
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-3">
          {product.images.map((img, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-sm overflow-hidden relative group border border-gray-200">
              <img src={img} className="w-full h-full object-cover" alt="" />
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
