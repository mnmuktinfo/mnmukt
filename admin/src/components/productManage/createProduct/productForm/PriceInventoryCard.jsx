import { DollarSign, Sparkles } from "lucide-react";
import React from "react";
import Card from "../ui/Card";
import FieldLabel from "../ui/FieldLabel";
import Input from "../ui/Input";

const PriceInventoryCard = ({ product, handleChange, discount }) => {
  // Shared Flipkart-style input classes
  const inputClasses =
    "w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow bg-white";

  return (
    <Card icon={DollarSign} title="Pricing & Inventory">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Selling Price */}
        <div>
          <FieldLabel required subtitle="Final price for the customer.">
            Selling Price (PKR)
          </FieldLabel>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787] font-medium text-[14px]">
              ₨
            </span>
            {/* Note: Assuming your `<Input>` component accepts and appends the `className` prop properly */}
            <Input
              name="price"
              type="number"
              min="0"
              value={product.price}
              onChange={handleChange}
              placeholder="1999"
              className={`${inputClasses} pl-8 font-medium`}
            />
          </div>
        </div>

        {/* Original Price */}
        <div>
          <FieldLabel subtitle="Leave blank if no discount.">
            MRP / Original Price (PKR)
          </FieldLabel>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#878787] font-medium text-[14px]">
              ₨
            </span>
            <Input
              name="originalPrice"
              type="number"
              min="0"
              value={product.originalPrice}
              onChange={handleChange}
              placeholder="2999"
              className={`${inputClasses} pl-8`}
            />
          </div>
        </div>

        {/* Stock Quantity */}
        <div>
          <FieldLabel subtitle="Total units available.">
            Stock Quantity
          </FieldLabel>
          <div className="mt-1">
            <Input
              name="stock"
              type="number"
              min="0"
              value={product.stock}
              onChange={handleChange}
              placeholder="50"
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Discount Banner - Flipkart Offer Style */}
      {discount > 0 && (
        <div className="mt-6 flex items-center gap-2 p-3 bg-[#f2f8f5] border border-[#388e3c] rounded-sm text-[#388e3c] text-[14px] font-medium shadow-sm">
          <Sparkles size={16} />
          <span>
            Buyers will see a <span className="font-bold">{discount}% OFF</span>{" "}
            discount tag.
          </span>
        </div>
      )}
    </Card>
  );
};

export default PriceInventoryCard;
