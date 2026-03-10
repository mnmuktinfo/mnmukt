import React, { useState } from "react";
import { productService } from "../services/firebase/taruveda";
import { Loader2 } from "lucide-react";

const categories = ["Hair Care", "Skin Care", "Body Care", "Combos"];

export default function TaruvedaAdminCreateProduct() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    rating: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const newProduct = {
        ...formData,
        price: Number(formData.price),
        rating: Number(formData.rating || 4),
      };

      await productService.createTaruvedaProduct(newProduct);

      setMessage({ type: "success", text: "Product created successfully!" });

      setFormData({
        name: "",
        category: "",
        price: "",
        rating: "",
        image: "",
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to create product" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <div className="max-w-xl mx-auto bg-white shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-[#1a2e1f]">
          Create New Product
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 text-sm font-medium ${
              message.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-700"
            }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Product Name */}
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 focus:outline-none focus:border-green-700"
          />

          {/* Category */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border p-3 focus:outline-none focus:border-green-700">
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={handleChange}
            className="border p-3 focus:outline-none focus:border-green-700"
          />

          {/* Rating */}
          <input
            type="number"
            name="rating"
            placeholder="Rating (1-5)"
            min="1"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            className="border p-3 focus:outline-none focus:border-green-700"
          />

          {/* Image URL */}
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            className="border p-3 focus:outline-none focus:border-green-700"
          />

          {/* Image Preview */}
          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="h-40 object-cover mt-2 border"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a2e1f] text-white py-3 font-bold uppercase tracking-widest hover:bg-green-800 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
