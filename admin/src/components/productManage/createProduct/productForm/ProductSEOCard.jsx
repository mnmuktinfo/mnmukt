import React from "react";
import FieldLabel from "../ui/FieldLabel";
import Card from "../ui/Card";
import Textarea from "../ui/Textarea";
import Input from "../ui/Input";
import { Search } from "lucide-react";

const ProductSEOCard = ({ product, handleChange }) => {
  return (
    <Card icon={Search} title="Search Engine Optimization (SEO)">
      <div className="space-y-6">
        <div>
          <FieldLabel subtitle="The title that appears in search engines (Max 60 chars).">
            Meta Title
          </FieldLabel>
          <Input
            name="seo.metaTitle"
            value={product.seo?.metaTitle || ""}
            onChange={handleChange}
            placeholder="e.g. Buy Premium Men's Cotton Shirt Online | BrandName"
            maxLength={60}
          />
        </div>

        <div>
          <FieldLabel subtitle="The description that appears below the title in search results (Max 160 chars).">
            Meta Description
          </FieldLabel>
          <Textarea
            name="seo.metaDescription"
            rows={3}
            value={product.seo?.metaDescription || ""}
            onChange={handleChange}
            placeholder="Enter a compelling description for search engines..."
            maxLength={160}
          />
        </div>

        <div>
          <FieldLabel subtitle="Comma separated keywords related to the product.">
            Meta Keywords
          </FieldLabel>
          <Input
            name="seo.metaKeywords"
            value={product.seo?.metaKeywords || ""}
            onChange={handleChange}
            placeholder="e.g. cotton shirt, men's formal wear, premium clothing"
          />
        </div>
      </div>
    </Card>
  );
};

export default ProductSEOCard;
