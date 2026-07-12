import React from "react";
import { FolderTree, X } from "lucide-react";

import Card from "../ui/Card";
import FieldLabel from "../ui/FieldLabel";
import Select from "../ui/Select";

const ProductOrganizationCard = ({
  newCollection,
  product,
  handleChange,
  CATEGORIES,
  setProduct,
  COLLECTIONS,
  setNewCollection,
}) => {
  return (
    <Card icon={FolderTree} title="Organization">
      <div className="space-y-6">
        {/* ─── CATEGORY SECTION ──────────────────────────────────────────── */}
        <div>
          <FieldLabel required>Category</FieldLabel>
          <Select
            name="categoryId"
            value={product.categoryId || ""}
            onChange={handleChange}
            className="w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow">
            <option value="">Select Category</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {/* ─── COLLECTION SECTION ────────────────────────────────────────── */}
        <div>
          <FieldLabel>
            Collections{" "}
            <span className="text-[#878787] font-normal text-[13px]">
              (Optional)
            </span>
          </FieldLabel>

          <div className="space-y-4 mt-1">
            {/* Selected chips */}
            {product.collectionTypes?.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {product.collectionTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1.5 text-[14px] bg-[#f1f3f6] text-[#212121] border border-[#e0e0e0] rounded-sm flex items-center gap-2 shadow-sm">
                    {type}
                    <button
                      type="button"
                      onClick={() =>
                        setProduct((p) => ({
                          ...p,
                          collectionTypes: (p.collectionTypes || []).filter(
                            (t) => t !== type,
                          ),
                        }))
                      }
                      className="text-[#878787] hover:text-[#ff6161] transition-colors p-0.5 rounded-full hover:bg-red-50"
                      title="Remove">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Select predefined collections */}
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;

                setProduct((p) => ({
                  ...p,
                  collectionTypes: [
                    ...new Set([...(p.collectionTypes || []), value]),
                  ],
                }));
                e.target.value = ""; // Reset select
              }}
              className="w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow bg-white">
              <option value="">Select predefined collection...</option>
              {COLLECTIONS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>

            {/* Custom collection input */}
            <div className="flex gap-3">
              <input
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!newCollection.trim()) return;

                    setProduct((p) => ({
                      ...p,
                      collectionTypes: [
                        ...new Set([
                          ...(p.collectionTypes || []),
                          newCollection.trim().toLowerCase(),
                        ]),
                      ],
                    }));
                    setNewCollection("");
                  }
                }}
                placeholder="Or add a custom collection"
                className="w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow"
              />

              <button
                type="button"
                disabled={!newCollection.trim()}
                onClick={() => {
                  if (!newCollection.trim()) return;
                  setProduct((p) => ({
                    ...p,
                    collectionTypes: [
                      ...new Set([
                        ...(p.collectionTypes || []),
                        newCollection.trim().toLowerCase(),
                      ]),
                    ],
                  }));
                  setNewCollection("");
                }}
                className="px-6 py-2.5 bg-[#2874f0] disabled:bg-[#a0c3ff] disabled:cursor-not-allowed hover:bg-[#1d5ed8] text-white font-medium rounded-sm shadow-sm text-[14px] transition-colors whitespace-nowrap">
                ADD
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductOrganizationCard;
