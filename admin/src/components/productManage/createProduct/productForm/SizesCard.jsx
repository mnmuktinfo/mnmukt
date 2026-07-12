import React from "react";
import { Ruler, X, AlertTriangle, Info } from "lucide-react";
import Input from "../ui/Input";
import Card from "../ui/Card";

const SizesCard = ({
  PRESET_SIZES,
  product,
  togglePresetSize,
  addCustomSize,
  customSizeInput,
  setCustomSizeInput,
  customSizeRef, // 👈 FIXED: Now correctly accepted as a prop from the hook
  removeSize,
}) => {
  const handleAddCustomSize = () => {
    if (customSizeInput.trim()) {
      addCustomSize();
      // Focus back on input for rapid data entry
      customSizeRef.current?.focus();
    }
  };

  return (
    <Card icon={Ruler} title="Sizes & Variants">
      <div className="space-y-6">
        {/* ─── PRESET SIZES ──────────────────────────────────────────────── */}
        <div>
          <p className="text-[13px] font-medium text-[#878787] mb-2.5">
            Standard Sizes
          </p>
          <div className="flex flex-wrap gap-3">
            {PRESET_SIZES.map((size) => {
              const isActive = product.sizes?.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => togglePresetSize(size)}
                  className={`min-w-[50px] h-10 px-3 rounded-sm text-[14px] font-medium border transition-all active:scale-95
                    ${
                      isActive
                        ? "bg-[#2874F0] text-white border-[#2874F0] shadow-sm"
                        : "bg-white text-[#212121] border-[#d7d7d7] hover:border-[#2874F0] hover:text-[#2874F0]"
                    }`}>
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── CUSTOM SIZES ──────────────────────────────────────────────── */}
        <div>
          <p className="text-[13px] font-medium text-[#878787] mb-2.5">
            Custom Size (e.g. 38, 40, Free Size)
          </p>
          <div className="flex gap-3">
            <Input
              ref={customSizeRef}
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSize();
                }
              }}
              placeholder="Enter custom size..."
              className="max-w-[250px]"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              disabled={!customSizeInput.trim()}
              className="px-6 py-2 bg-white border border-[#d7d7d7] text-[#212121] text-sm font-medium rounded-sm hover:bg-[#f1f3f6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Add Size
            </button>
          </div>
        </div>

        {/* ─── SELECTED SIZES DISPLAY ────────────────────────────────────── */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="pt-5 border-t border-[#e0e0e0]">
            <p className="text-[13px] font-medium text-[#878787] mb-3">
              Selected Sizes for Variants
            </p>
            <div className="flex flex-wrap gap-2.5 mb-4">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f3f6] border border-[#e0e0e0] rounded-sm text-[14px] text-[#212121] font-medium group">
                  {size}
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="text-[#878787] group-hover:text-[#c62828] transition-colors p-0.5 rounded-full hover:bg-[#ffebee]"
                    title={`Remove ${size}`}>
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>

            {/* ─── INFO NOTE ────────────────────────────────────── */}
            <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 flex items-start gap-2 text-blue-800">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed">
                <span className="font-semibold block mb-1">About Sizes</span>
                These sizes are shown as available options to customers. Stock
                and SKU for this product are tracked as a single combined total
                — not broken down per size. Removing a size here only removes it
                from the list; it does not affect stock or SKU.
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SizesCard;
