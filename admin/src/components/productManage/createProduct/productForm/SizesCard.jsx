import { Ruler, X } from "lucide-react";
import React, { useRef } from "react";
import Input from "../ui/Input";
import Card from "../ui/Card";

const SizesCard = ({
  PRESET_SIZES,
  product,
  togglePresetSize,
  addCustomSize,
  customSizeInput,
  setCustomSizeInput,
  removeSize,
}) => {
  const customSizeRef = useRef(null);

  return (
    <Card icon={Ruler} title="Sizes & Variants">
      {/* Preset Sizes */}
      <div>
        <p className="text-[13px] font-medium text-[#878787] mb-2">
          Standard Sizes
        </p>
        <div className="flex flex-wrap gap-3">
          {PRESET_SIZES.map((size) => {
            const on = product.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => togglePresetSize(size)}
                className={`min-w-12.5 h-10 px-3 rounded-sm text-[14px] font-medium border transition-colors
                          ${
                            on
                              ? "bg-[#2874F0] text-white border-[#2874F0]"
                              : "bg-white text-[#212121] border-[#d7d7d7] hover:border-[#2874F0] hover:text-[#2874F0]"
                          }`}>
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Sizes */}
      <div className="pt-2">
        <p className="text-[13px] font-medium text-[#878787] mb-2">
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
                addCustomSize();
              }
            }}
            placeholder="Enter custom size..."
            className="max-w-[250px]"
          />
          <button
            type="button"
            onClick={addCustomSize}
            disabled={!customSizeInput.trim()}
            className="px-6 py-2 bg-white border border-[#d7d7d7] text-[#212121] text-sm font-medium rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
            Add Size
          </button>
        </div>
      </div>

      {/* Selected Sizes Display */}
      {product.sizes.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[13px] font-medium text-[#878787] mb-3">
            Selected Sizes
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f3f6] border border-[#e0e0e0] rounded-sm text-[14px] text-[#212121] font-medium">
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="text-[#878787] hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SizesCard;
