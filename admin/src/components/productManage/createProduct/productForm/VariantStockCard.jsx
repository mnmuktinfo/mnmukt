import React from "react";
import { Boxes, AlertCircle } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";

const VariantStockCard = ({ product, variantList, updateVariantStock }) => {
  const noSku = !product.sku?.trim();

  const totalStock = variantList.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <Card icon={Boxes} title="Variant Stock">
      <p className="text-[13px] text-[#878787] mb-4 -mt-2">
        Set stock quantity for each size/color combination. This total feeds the
        read-only "Total Stock" field above.
      </p>

      {noSku && (
        <div className="flex items-start gap-2 text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-sm p-3 mb-4">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>
            Enter a Base SKU in the Pricing section first — variant SKUs preview
            here once it's set.
          </p>
        </div>
      )}

      {variantList.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No variants yet — add sizes and/or colors to generate variant rows.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_100px] gap-3 px-1 text-[12px] font-medium text-[#878787] uppercase tracking-wide">
            <span>SKU</span>
            <span>Color / Size</span>
            <span className="text-right">Stock</span>
          </div>

          {variantList.map((v) => (
            <div
              key={v.sku}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px] gap-3 items-center p-3 border border-[#e0e0e0] rounded-sm bg-white">
              <span className="text-[13px] font-mono text-[#212121] break-all">
                {v.sku}
              </span>

              <div className="flex items-center gap-2 text-[13px] text-[#212121]">
                {v.colorHex && (
                  <span
                    className="w-4 h-4 rounded-full border border-[#e0e0e0] shrink-0"
                    style={{ backgroundColor: v.colorHex }}
                    title={v.colorName}
                  />
                )}
                <span>
                  {v.colorName} · {v.size}
                </span>
              </div>

              <Input
                type="number"
                min="0"
                value={v.stock}
                onChange={(e) => updateVariantStock(v.sku, e.target.value)}
                className="text-right"
              />
            </div>
          ))}

          <div className="flex justify-end pt-2 border-t border-[#e0e0e0] mt-2">
            <span className="text-[13px] font-medium text-[#212121]">
              Total: <span className="text-[#2874F0]">{totalStock}</span> units
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VariantStockCard;
