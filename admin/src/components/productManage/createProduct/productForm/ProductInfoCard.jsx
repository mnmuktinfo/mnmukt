import React from "react";
import { Package } from "lucide-react";

import FieldLabel from "../ui/FieldLabel";
import Card from "../ui/Card";
import Textarea from "../ui/Textarea";
import Input from "../ui/Input";

const ProductInfoCard = ({ product, handleChange }) => {
  return (
    <Card icon={Package} title="Product Information">
      <div className="space-y-6">
        {/* ─── PRODUCT NAME & BRAND ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FieldLabel required subtitle="Use a clear, descriptive name.">
              Product Name
            </FieldLabel>
            <Input
              name="name"
              value={product.name || ""}
              onChange={handleChange}
              placeholder="e.g. Pearl White Co-ord Set"
            />
          </div>

          <div>
            <FieldLabel subtitle="The manufacturer or brand of the product.">
              Brand
            </FieldLabel>
            <Input
              name="brand"
              value={product.brand || ""}
              onChange={handleChange}
              placeholder="e.g. Babli"
            />
          </div>
        </div>

        {/* ─── SHORT DESCRIPTION ─────────────────────────────────────────── */}
        <div>
          <FieldLabel subtitle="A brief summary for product cards and quick views.">
            Short Description
          </FieldLabel>
          <Textarea
            name="shortDescription"
            rows={2}
            value={product.shortDescription || ""}
            onChange={handleChange}
            placeholder="e.g. Elegant handcrafted handloom cotton co-ord set for everyday comfort."
          />
        </div>

        {/* ─── LONG DESCRIPTION (HTML) ───────────────────────────────────── */}
        {/* 👈 FIXED: was bound to "longDescription", a field that doesn't
            exist on the hook's product state. The hook stores this under
            "description" (see INITIAL_PRODUCT), so that's what we bind to. */}
        <div>
          <FieldLabel subtitle="Detailed HTML description. You can use the ChatGPT generator above to create this.">
            Long Description (HTML)
          </FieldLabel>
          <Textarea
            name="description"
            rows={8}
            value={product.description || ""}
            onChange={handleChange}
            placeholder="Paste the generated HTML here, or type your own (e.g., <h3>Key Features</h3><ul>...)"
          />
        </div>
      </div>
    </Card>
  );
};

export default ProductInfoCard;
