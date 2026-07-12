import React from "react";
import { IndianRupee } from "lucide-react";
import Card from "../ui/Card";
import FieldLabel from "../ui/FieldLabel";
import Input from "../ui/Input";

const PriceInventoryCard = ({ product, handleChange }) => {
  return (
    <Card icon={IndianRupee} title="Pricing, Inventory & SKU">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* ─── SELLING PRICE ─────────────────────────────────────────────── */}
        <div>
          <FieldLabel required subtitle="The final selling price.">
            Selling Price (₹)
          </FieldLabel>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787] font-medium">
              ₹
            </span>
            <Input
              type="number"
              name="price"
              value={product.price || ""}
              onChange={handleChange}
              placeholder="0.00"
              className="pl-8"
              min="0"
            />
          </div>
        </div>

        {/* ─── ORIGINAL / MRP (optional, for strikethrough discount) ─────── */}
        <div>
          <FieldLabel subtitle="Optional. Shown as a strikethrough price if higher than selling price.">
            Original Price (₹)
          </FieldLabel>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787] font-medium">
              ₹
            </span>
            <Input
              type="number"
              name="originalPrice"
              value={product.originalPrice || ""}
              onChange={handleChange}
              placeholder="0.00"
              className="pl-8"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* ─── BASE SKU ──────────────────────────────────────────────────── */}
        <div>
          <FieldLabel
            required
            subtitle="Base Stock Keeping Unit (e.g., PROD-WHT)">
            Base SKU
          </FieldLabel>
          <Input
            name="sku"
            value={product.sku || ""}
            onChange={handleChange}
            placeholder="e.g. BABLI-WHT-COORD"
            className="uppercase"
          />
        </div>

        {/* ─── STOCK QUANTITY ────────────────────────────────────────────── */}
        <div>
          <FieldLabel required subtitle="Total available stock quantity.">
            Stock Quantity
          </FieldLabel>
          <Input
            type="number"
            name="stock"
            value={product.stock || ""}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      {/* ─── LOW STOCK THRESHOLD ───────────────────────────────────────── */}
      <div className="mt-6 max-w-[50%]">
        <FieldLabel subtitle="Get flagged as low-stock at or below this quantity.">
          Low Stock Threshold
        </FieldLabel>
        <Input
          type="number"
          name="lowStockThreshold"
          value={product.lowStockThreshold || ""}
          onChange={handleChange}
          placeholder="e.g. 5"
          min="0"
        />
      </div>
    </Card>
  );
};

export default PriceInventoryCard;
