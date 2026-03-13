import React from "react";
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
  FolderTree,
}) => {
  return (
    <Card icon={FolderTree} title="Organization">
      <div className="space-y-6">
        {/* Category Section */}
        <div>
          <FieldLabel required>Category</FieldLabel>
          {/* Assuming your Select component accepts classNames. If not, you may need to apply these to its internal <select> */}
          <Select
            name="categoryId"
            value={product.categoryId}
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

        {/* Collection Section */}
        <div>
          <FieldLabel>
            Collection{" "}
            <span className="text-[#878787] font-normal text-[13px]">
              (Optional)
            </span>
          </FieldLabel>

          <div className="space-y-4 mt-1">
            {/* Selected chips - Flipkart Style (Light gray background, dark text) */}
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
                          collectionTypes: p.collectionTypes.filter(
                            (t) => t !== type,
                          ),
                        }))
                      }
                      className="text-[#878787] hover:text-[#ff6161] text-lg leading-none transition-colors"
                      title="Remove">
                      &times;
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
                placeholder="Or add a custom collection"
                className="w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow"
              />

              <button
                type="button"
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
                className="px-6 py-2.5 bg-[#2874f0] hover:bg-[#1d5ed8] text-white font-medium rounded-sm shadow-sm text-[14px] transition-colors whitespace-nowrap">
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
