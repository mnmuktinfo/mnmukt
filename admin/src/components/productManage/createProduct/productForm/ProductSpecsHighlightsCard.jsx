import React from "react";
import { List, Plus, Trash2 } from "lucide-react";
import FieldLabel from "../ui/FieldLabel";
import Card from "../ui/Card";
import Input from "../ui/Input";

const ProductSpecsHighlightsCard = ({
  product,
  addDynamicItem,
  updateDynamicItem,
  removeDynamicItem,
}) => {
  // We now only use the 'highlights' array from your new skeleton
  const highlights = product.highlights || [];

  return (
    <Card icon={List} title="Product Highlights">
      <div>
        <div className="flex justify-between items-center mb-4">
          <FieldLabel subtitle="Add key features (e.g. Fabric -> Handloom Cotton)">
            Highlights
          </FieldLabel>
          <button
            type="button"
            onClick={() =>
              addDynamicItem("highlights", { title: "", value: "" })
            }
            className="flex items-center gap-1 text-sm text-[#2874f0] font-medium hover:underline">
            <Plus className="w-4 h-4" /> Add Highlight
          </button>
        </div>

        {highlights.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No highlights added yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {highlights.map((hl, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                <Input
                  value={hl.title || ""}
                  onChange={(e) =>
                    updateDynamicItem(
                      "highlights",
                      index,
                      "title",
                      e.target.value,
                    )
                  }
                  placeholder="Title (e.g. Fabric)"
                />
                <Input
                  value={hl.value || ""}
                  onChange={(e) =>
                    updateDynamicItem(
                      "highlights",
                      index,
                      "value",
                      e.target.value,
                    )
                  }
                  placeholder="Value (e.g. Handloom Cotton)"
                />
                <button
                  type="button"
                  onClick={() => removeDynamicItem("highlights", index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded">
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
