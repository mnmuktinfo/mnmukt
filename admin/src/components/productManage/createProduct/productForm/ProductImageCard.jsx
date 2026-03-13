import { ImageIcon, Loader2, UploadCloud } from "lucide-react";
import React from "react";

const ProductImageCard = ({ uploadingBanner, product, handleBannerUpload }) => {
  return (
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
  );
};

export default ProductImageCard;
