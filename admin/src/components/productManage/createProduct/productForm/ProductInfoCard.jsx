import React from "react";
import FieldLabel from "../ui/FieldLabel";
import Card from "../ui/Card";
import Textarea from "../ui/Textarea";
import Input from "../ui/Input";
import { Package } from "lucide-react";

const ProductInfoCard = ({ product, handleChange }) => {
  return (
    <Card icon={Package} title="Product Information">
      <div>
        <FieldLabel required subtitle="Use a clear, descriptive name.">
          Product Name
        </FieldLabel>
        <Input
          name="name"
          value={product.name}
          onChange={handleChange}
          placeholder="e.g. Men's Solid Formal Cotton Shirt"
        />
      </div>

      <div>
        <FieldLabel subtitle="Provide details about fit, fabric, and care instructions.">
          Description
        </FieldLabel>
        <Textarea
          name="description"
          rows={4}
          value={product.description}
          onChange={handleChange}
          placeholder="Enter detailed product description..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Fabric / Material</FieldLabel>
          <Input
            name="material"
            value={product.material}
            onChange={handleChange}
            placeholder="e.g. 100% Cotton"
          />
        </div>
        <div>
          <FieldLabel>Brand Name</FieldLabel>
          <Input
            name="brand"
            value={product.brand}
            onChange={handleChange}
            placeholder="e.g. Generic, Nike, Levi's"
          />
        </div>
      </div>
    </Card>
  );
};

export default ProductInfoCard;
