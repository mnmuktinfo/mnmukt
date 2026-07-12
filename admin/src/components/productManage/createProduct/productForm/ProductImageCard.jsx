import { ImagePlus, Loader2, Info } from "lucide-react";
import React from "react";

const ProductImageCard = ({ uploadingImage, product, handleImageUpload }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <ImagePlus size={18} className="text-[#2874F0]" />
        <h2 className="text-base font-medium text-[#212121]">
          Featured Image <span className="text-red-500">*</span>
        </h2>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start gap-2 text-[12px] text-[#878787] bg-[#f1f3f6] p-2.5 rounded-sm border border-[#e0e0e0]">
          <Info size={14} className="shrink-0 text-[#2874F0] mt-0.5" />
          <p>
            This image acts as the primary thumbnail and the{" "}
            <span className="font-medium text-[#212121]">
              default fallback image
            </span>{" "}
            for your cart and order variants if a specific color image is not
            provided.
          </p>
        </div>

        <label className="relative flex flex-col items-center justify-center w-full aspect-square border border-dashed border-[#d7d7d7] rounded-sm cursor-pointer bg-[#f1f3f6] hover:border-[#2874F0] hover:bg-blue-50/30 transition-all overflow-hidden group">
          {uploadingImage ? (
            <div className="flex flex-col items-center text-[#2874F0]">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <span className="text-[13px] font-medium">
                Uploading image...
              </span>
            </div>
          ) : product.image ? (
            <>
              <img
                src={product.image}
                className="w-full h-full object-cover"
                alt="Featured"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImagePlus className="w-8 h-8 text-white mb-2" />
                <span className="text-white text-[14px] font-medium">
                  Change Image
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mb-3">
                <ImagePlus size={20} className="text-[#2874F0]" />
              </div>
              <span className="text-[14px] font-medium text-[#212121]">
                Add Featured Image
              </span>
              <span className="text-[12px] text-[#878787] mt-1 px-4">
                500x500px or larger recommended.
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
        </label>
      </div>
    </div>
  );
};

export default ProductImageCard;
