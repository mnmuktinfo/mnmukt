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
        <FieldLabel subtitle="A brief summary for cards and quick views (Max 150 chars).">
          Short Description
        </FieldLabel>
        <Textarea
          name="shortDescription"
          rows={2}
          value={product.shortDescription || ""}
          onChange={handleChange}
          placeholder="Enter a short, catchy summary..."
          maxLength={150}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <FieldLabel subtitle="Provide detailed information about the product.">
            Full Description
          </FieldLabel>
          <button
            type="button"
            onClick={() => {
              const prompt = `Please generate a product description HTML for an eCommerce website.
Product Name: ${product.name || "Unknown"}
Fabric/Material: ${product.material || "Unknown"}
Gender: ${product.gender || "Unknown"}
Season: ${product.season || "Unknown"}

The HTML should EXACTLY follow this structure (no markdown wrappers, just raw HTML):
<b>Key Features</b><br/>
Fabric: [describe the fabric]<br/>
Colour: [derive from name or specify]<br/>
Neckline: [guess or generic]<br/>
<br/>
<b>Details:</b><br/>
- [bullet point detail 1]<br/>
- [bullet point detail 2]<br/>
<br/>
<b>Fit:</b> Comfy and relaxed fit<br/>
<b>Silhouette:</b> Beautiful silhouette for a flowy look<br/>
<br/>
<b>Measurements</b><br/>
Length: Standard<br/>
<br/>
<b>Size Guide:</b><br/>
This is designed for a Comfort fit.`;

              navigator.clipboard.writeText(prompt).then(() => {
                alert("Prompt copied to clipboard! Paste it into ChatGPT.");
                window.open("https://chatgpt.com", "_blank");
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md hover:from-purple-600 hover:to-indigo-700 shadow-sm transition-all duration-200"
          >
            <span className="text-[14px]">✨</span> Generate with AI
          </button>
        </div>
        <Textarea
          name="description"
          rows={5}
          value={product.description || ""}
          onChange={handleChange}
          placeholder="Enter detailed product description or paste HTML from ChatGPT..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <FieldLabel>Gender / Audience</FieldLabel>
          <select
            name="gender"
            value={product.gender || "Unisex"}
            onChange={handleChange}
            className="w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow bg-white"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>
        
        <div>
          <FieldLabel>Season</FieldLabel>
          <select
            name="season"
            value={product.season || "All Season"}
            onChange={handleChange}
            className="w-full border border-[#e0e0e0] text-[#212121] p-2.5 rounded-sm focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] text-[14px] transition-shadow bg-white"
          >
            <option value="Summer">Summer</option>
            <option value="Winter">Winter</option>
            <option value="Monsoon">Monsoon</option>
            <option value="Festive">Festive</option>
            <option value="All Season">All Season</option>
          </select>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <FieldLabel>Fabric / Material</FieldLabel>
          <Input
            name="material"
            value={product.material || ""}
            onChange={handleChange}
            placeholder="e.g. 100% Cotton"
          />
        </div>
        <div>
          <FieldLabel>Brand Name</FieldLabel>
          <Input
            name="brand"
            value={product.brand || ""}
            onChange={handleChange}
            placeholder="e.g. Generic, Nike, Levi's"
          />
        </div>
      </div>
    </Card>
  );
};

export default ProductInfoCard;
