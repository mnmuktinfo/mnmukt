import React, { useState } from "react";
import { FaPlus, FaSpinner, FaRupeeSign } from "react-icons/fa";
import { CartService } from "../../services/cartService";
import { COLORS } from "../../style/theme";

const ItemCard = ({ item, onDetailClick }) => {
  const [adding, setAdding] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAddToCart = async (e, itemId, unit) => {
    e.stopPropagation(); // Prevents the card click event from firing

    try {
      setAdding(true);
      await CartService.addToCart(user._id, itemId, 1, unit);
      // notify("success", "Item added to cart ✅");
    } catch (err) {
      // notify("error", err?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={onDetailClick}
      className="group flex flex-col rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden h-full cursor-pointer relative"
      style={{
        background: COLORS.light,
        borderColor: COLORS.secondary, // Keeping your theme integration
      }}>
      {/* Image Section - Gray background helps products stand out */}
      <div className="relative aspect-square w-full bg-[#f8f9fa] overflow-hidden p-4 flex items-center justify-center">
        <img
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
          src={
            item.banner ||
            "https://via.placeholder.com/300x300?text=Product+Image"
          }
          alt={item.name}
        />

        {/* Optional: Discount/Tag Badge could go here in the top left */}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-4 flex-1 gap-2">
        {/* Product Name */}
        <h3
          className="text-[14px] font-medium leading-snug line-clamp-2 h-10"
          style={{ color: COLORS.text }}
          title={item.name}>
          {item.name}
        </h3>

        {/* Price & Action Area */}
        {item?.price?.length > 0 && (
          <div className="flex items-end justify-between mt-auto pt-2">
            {/* Price Block */}
            <div className="flex flex-col">
              <span
                className="text-[12px] mb-0.5 font-medium uppercase tracking-wider"
                style={{ color: COLORS.textAlt }}>
                {item?.price?.[0]?.unit}
              </span>
              <div
                className="flex items-center font-bold text-[16px]"
                style={{ color: COLORS.text }}>
                <FaRupeeSign className="text-[14px]" />
                <span>{item?.price?.[0]?.price?.toFixed(2)}</span>
              </div>
            </div>

            {/* Add to Cart Button - Now persistently visible for better mobile UX */}
            <button
              onClick={(e) =>
                handleAddToCart(e, item._id, item?.price?.[0]?.unit)
              }
              disabled={adding}
              className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-sm border border-gray-200 hover:bg-[#2874f0] hover:text-white hover:border-[#2874f0] transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed bg-white"
              style={{
                color: COLORS.text,
              }}
              aria-label="Add to cart">
              {adding ? (
                <FaSpinner className="animate-spin text-[14px] text-gray-500" />
              ) : (
                <FaPlus className="text-[14px]" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
