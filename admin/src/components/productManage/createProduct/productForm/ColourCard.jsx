import React from "react";
import {
  Palette,
  Trash2,
  UploadCloud,
  Loader2,
  Plus,
  AlertTriangle,
  Info,
} from "lucide-react";
import Input from "../ui/Input";
import Card from "../ui/Card";

// 👈 FIXED: was calling a generic `updateColor(idx, field, value)`, but the
// hook only exposes two separate setters — `updateColorName(idx, val)` and
// `updateColorHex(idx, val)` — there's no unified updateColor. Wired both in.
const ColourCard = ({
  product,
  addColor,
  uploadingColorIdx,
  updateColorName,
  updateColorHex,
  removeColor,
  handleColorImageUpload,
}) => {
  return (
    <Card icon={Palette} title="Color Options & Swatches">
      <p className="text-[13px] text-[#878787] mb-4 -mt-2">
        Upload a specific image and select a hex swatch for each color variant.
      </p>

      <div className="space-y-4">
        {(!product.colors || product.colors.length === 0) && (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-[#e0e0e0] rounded-sm text-[#878787] bg-[#fafafa]">
            <Palette size={32} className="mb-3 text-[#d7d7d7]" />
            <p className="text-[14px] font-medium">
              No color options added yet.
            </p>
          </div>
        )}

        {product.colors?.map((color, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 border border-[#e0e0e0] rounded-sm bg-white shadow-sm">
            {/* 1. Color Image Upload */}
            <label className="relative w-16 h-16 shrink-0 rounded-sm border border-[#e0e0e0] bg-[#f1f3f6] overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#2874F0] transition-colors group">
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
                  <UploadCloud size={20} className="opacity-60" />
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

            {/* 2. Hex Swatch Picker */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <input
                type="color"
                value={color.hex || "#000000"}
                onChange={(e) => updateColorHex(idx, e.target.value)}
                className="w-10 h-10 p-0.5 border border-[#e0e0e0] rounded-sm cursor-pointer bg-white"
                title="Select swatch color"
              />
              <span className="text-[10px] text-[#878787] uppercase font-medium">
                {color.hex || "Hex"}
              </span>
            </div>

            {/* 3. Color Name */}
            <Input
              value={color.name || ""}
              onChange={(e) => updateColorName(idx, e.target.value)}
              placeholder="Color Name (e.g. Navy Blue)"
              className="flex-1"
            />

            {/* 4. Remove Action */}
            <button
              type="button"
              onClick={() => removeColor(idx)}
              className="p-2.5 text-[#878787] hover:text-[#c62828] hover:bg-[#ffebee] rounded-sm transition-colors border border-transparent"
              title="Remove Color">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {/* ─── INFO NOTE ────────────────────────────────────── */}
        {product.colors && product.colors.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 mt-4 flex items-start gap-2 text-blue-800">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-semibold block mb-1">
                About Color Variants
              </span>
              Each color can have its own name, swatch, and image. Stock and SKU
              for this product are tracked as a single combined total — not
              broken down per color. Removing a color here only removes it from
              the list; it does not affect stock or SKU.
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={addColor}
          className="flex items-center gap-2 text-[14px] font-medium text-[#2874F0] px-5 py-3 border border-dashed border-[#2874F0]/40 rounded-sm w-full justify-center hover:bg-[#f1f6ff] transition-colors mt-2">
          <Plus size={18} />
          Add New Color Variant
        </button>
      </div>
    </Card>
  );
};

export default ColourCard;
