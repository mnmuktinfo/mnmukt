import React from "react";
import FieldLabel from "../ui/FieldLabel";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { Tag } from "lucide-react";

const ProductAttributesCard = ({ product, handleChange }) => {
  const inputClasses = "w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow bg-white";

  return (
    <Card icon={Tag} title="Physical Attributes & Design">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <FieldLabel>Pattern / Print</FieldLabel>
          <Input
            name="pattern"
            value={product.pattern || ""}
            onChange={handleChange}
            placeholder="e.g. Solid, Striped, Floral"
          />
        </div>

        <div>
          <FieldLabel>Fit</FieldLabel>
          <select
            name="fit"
            value={product.fit || ""}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select Fit</option>
            <option value="Slim Fit">Slim Fit</option>
            <option value="Regular Fit">Regular Fit</option>
            <option value="Relaxed Fit">Relaxed Fit</option>
            <option value="Oversized">Oversized</option>
          </select>
        </div>

        <div>
          <FieldLabel>Sleeve Type</FieldLabel>
          <select
            name="sleeve"
            value={product.sleeve || ""}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select Sleeve</option>
            <option value="Full Sleeve">Full Sleeve</option>
            <option value="Half Sleeve">Half Sleeve</option>
            <option value="Short Sleeve">Short Sleeve</option>
            <option value="Sleeveless">Sleeveless</option>
            <option value="3/4 Sleeve">3/4 Sleeve</option>
          </select>
        </div>

        <div>
          <FieldLabel>Neckline</FieldLabel>
          <Input
            name="neckline"
            value={product.neckline || ""}
            onChange={handleChange}
            placeholder="e.g. Round Neck, V-Neck, Collar"
          />
        </div>

        <div>
          <FieldLabel>Length</FieldLabel>
          <Input
            name="length"
            value={product.length || ""}
            onChange={handleChange}
            placeholder="e.g. Regular, Crop, Knee-length"
          />
        </div>

        <div>
          <FieldLabel>Occasion</FieldLabel>
          <select
            name="occasion"
            value={product.occasion || ""}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select Occasion</option>
            <option value="Casual">Casual</option>
            <option value="Formal">Formal</option>
            <option value="Party">Party</option>
            <option value="Festive">Festive</option>
            <option value="Activewear">Activewear</option>
          </select>
        </div>
      </div>

    </Card>
  );
};

export default ProductAttributesCard;
