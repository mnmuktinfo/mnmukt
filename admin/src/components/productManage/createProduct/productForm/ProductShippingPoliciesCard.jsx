import React from "react";
import FieldLabel from "../ui/FieldLabel";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import { Truck } from "lucide-react";

const ProductShippingPoliciesCard = ({ product, handleChange }) => {
  return (
    <Card icon={Truck} title="Shipping & Policies">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Ships In (Days)</FieldLabel>
          <Input
            name="shipping.shipsInDays"
            type="number"
            min="1"
            value={product.shipping?.shipsInDays || ""}
            onChange={handleChange}
            placeholder="e.g. 2"
          />
        </div>

        <div>
          <FieldLabel>Shipping Charges (PKR)</FieldLabel>
          <Input
            name="shipping.shippingCharges"
            type="number"
            min="0"
            value={product.shipping?.shippingCharges || ""}
            onChange={handleChange}
            placeholder="e.g. 150 (Leave 0 for Free Shipping)"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mt-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="shipping.isFreeShipping"
            checked={product.shipping?.isFreeShipping || false}
            onChange={handleChange}
            className="w-4 h-4 text-[#2874f0] border-gray-300 rounded focus:ring-[#2874f0]"
          />
          <span className="text-[14px] font-medium text-[#212121]">Free Shipping Applicable</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="shipping.codAvailable"
            checked={product.shipping?.codAvailable ?? true}
            onChange={handleChange}
            className="w-4 h-4 text-[#2874f0] border-gray-300 rounded focus:ring-[#2874f0]"
          />
          <span className="text-[14px] font-medium text-[#212121]">Cash on Delivery (COD) Available</span>
        </label>
      </div>

      <hr className="border-[#e0e0e0] my-6" />

      <div>
        <FieldLabel>Return Policy</FieldLabel>
        <Input
          name="policies.returnPolicy"
          value={product.policies?.returnPolicy || ""}
          onChange={handleChange}
          placeholder="e.g. 7 Days Easy Returns"
        />
      </div>

      <div>
        <FieldLabel>Exchange Policy</FieldLabel>
        <Input
          name="policies.exchangePolicy"
          value={product.policies?.exchangePolicy || ""}
          onChange={handleChange}
          placeholder="e.g. 7 Days Exchange Available"
        />
      </div>

      <div>
        <FieldLabel subtitle="Provide washing and care instructions.">
          Wash Care Instructions
        </FieldLabel>
        <Textarea
          name="policies.washCare"
          rows={3}
          value={product.policies?.washCare || ""}
          onChange={handleChange}
          placeholder="e.g. Machine wash cold, do not bleach..."
        />
      </div>

    </Card>
  );
};

export default ProductShippingPoliciesCard;
