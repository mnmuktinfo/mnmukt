import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRupeeSign } from "react-icons/fa";
import { toast } from "react-toastify";
import { CartService } from "../services/cartService";
import UnitSelector from "./unit/UnitSelector";
import QuantitySelector from "./unit/QuantitySelector";
import ActionButtons from "./ui/buttons/ActionButtons";

// Main ProductInfo Component
const ProductInfo = ({ item }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(item.price?.[0]?.unit || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = { _id: "66ae8f1725b306b4d3e8e195" }; // Placeholder user for demo

  // Get price for selected unit
  const currentPrice =
    item.price?.find((p) => p.unit === selectedUnit)?.price || 0;

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
  };

  const handleAddToCartClick = async () => {
    if (!user) {
      toast.info("Please login to add items to cart.", {
        position: "bottom-right",
      });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      setLoading(true);
      await CartService.addToCart(user._id, item._id, quantity, selectedUnit);
      toast.success("✅ Added to cart successfully!", {
        position: "bottom-right",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Failed to add to cart", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.info("Please login to proceed to checkout.", {
        position: "bottom-right",
      });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    // Logic for redirecting to checkout page goes here
    toast.success("Redirecting to checkout!", { position: "bottom-right" });
  };

  return (
    <div className="space-y-6 lg:space-y-8 p-4 md:p-6 bg-white rounded-lg shadow-lg">
      {/* Product Title and Price */}
      <div className="border-b pb-4 border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {item.name}
        </h1>
        <div className="flex items-center space-x-1">
          <FaRupeeSign className="text-2xl font-bold text-gray-900" />
          <span className="text-2xl font-bold text-gray-900">
            {currentPrice.toFixed(2)}
          </span>
          {selectedUnit && (
            <span className="text-sm text-gray-500 ml-1">/ {selectedUnit}</span>
          )}
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Product Details
          </h2>
          <p className="text-gray-700 leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Unit Selection */}
      <UnitSelector
        prices={item.price}
        selectedUnit={selectedUnit}
        onUnitSelect={handleUnitSelect}
      />

      {/* Quantity Selector */}
      <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

      {/* Action Buttons */}
      <ActionButtons
        loading={loading}
        onAddToCart={handleAddToCartClick}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
};

export default ProductInfo;
