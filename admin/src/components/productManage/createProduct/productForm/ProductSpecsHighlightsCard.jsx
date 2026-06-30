import React from "react";
import FieldLabel from "../ui/FieldLabel";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { List, Plus, Trash2 } from "lucide-react";

const ProductSpecsHighlightsCard = ({ 
  product, 
  addDynamicItem, 
  updateDynamicItem, 
  removeDynamicItem 
}) => {

  const specs = product.specifications || [];
  const highlights = product.highlights || [];

  return (
    <Card icon={List} title="Specifications & Highlights">
      
      {/* ─────────────────────────────
          Dynamic Specifications
      ───────────────────────────── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <FieldLabel subtitle="Add key-value pairs (e.g. Closure -> Shell Buttons)">
            Product Specifications
          </FieldLabel>
          <button
            type="button"
            onClick={() => addDynamicItem("specifications", { label: "", value: "" })}
            className="flex items-center gap-1 text-sm text-[#2874f0] font-medium hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Spec
          </button>
        </div>

        {specs.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No specifications added yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                <Input
                  value={spec.label}
                  onChange={(e) => updateDynamicItem("specifications", index, "label", e.target.value)}
                  placeholder="Label (e.g. Fabric)"
                />
                <Input
                  value={spec.value}
                  onChange={(e) => updateDynamicItem("specifications", index, "value", e.target.value)}
                  placeholder="Value (e.g. Handloom Cotton)"
                />
                <button
                  type="button"
                  onClick={() => removeDynamicItem("specifications", index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-[#e0e0e0] my-6" />

      {/* ─────────────────────────────
          Dynamic Highlights
      ───────────────────────────── */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <FieldLabel subtitle="Add feature highlights (e.g. Artisan Made)">
            Product Highlights
          </FieldLabel>
          <button
            type="button"
            onClick={() => addDynamicItem("highlights", { icon: "", title: "", description: "" })}
            className="flex items-center gap-1 text-sm text-[#2874f0] font-medium hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Highlight
          </button>
        </div>

        {highlights.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No highlights added yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {highlights.map((hl, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                <Input
                  value={hl.icon}
                  onChange={(e) => updateDynamicItem("highlights", index, "icon", e.target.value)}
                  placeholder="Icon Name/URL"
                  className="w-1/4"
                />
                <Input
                  value={hl.title}
                  onChange={(e) => updateDynamicItem("highlights", index, "title", e.target.value)}
                  placeholder="Title"
                  className="w-1/4"
                />
                <Input
                  value={hl.description}
                  onChange={(e) => updateDynamicItem("highlights", index, "description", e.target.value)}
                  placeholder="Short Description"
                  className="w-1/2"
                />
                <button
                  type="button"
                  onClick={() => removeDynamicItem("highlights", index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </Card>
  );
};

export default ProductSpecsHighlightsCard;
