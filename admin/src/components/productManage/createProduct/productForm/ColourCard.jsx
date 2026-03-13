import { Loader2, Palette, Plus, Trash2, UploadCloud } from "lucide-react";
import React from "react";
import Input from "../ui/Input";
import Card from "../ui/Card";

const ColourCard = ({
  product,
  addColor,
  uploadingColorIdx,
  updateColorName,
  removeColor,
  handleColorImageUpload,
}) => {
  return (
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
                  <span className="text-[10px] font-medium mt-1">Image</span>
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
  );
};

export default ColourCard;
