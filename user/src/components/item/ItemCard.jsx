import React, { useState } from "react";
import { FaPlus, FaSpinner, FaEye, FaRupeeSign } from "react-icons/fa";

import { CartService } from "../../services/cartService";
import { COLORS } from "../../style/theme";
const ItemCard = ({ item, onDetailClick }) => {
  const [adding, setAdding] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAddToCart = async (e, itemId, unit) => {
    e.stopPropagation();

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
      className="group flex flex-col rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full cursor-pointer"
      style={{
        background: COLORS.light,
        border: `1px solid ${COLORS.secondary}`,
      }}
      onClick={onDetailClick}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={
            item.coverImage ||
            "https://via.placeholder.com/300x300?text=Product+Image"
          }
          alt={item.name}
        />

        {/* Add button */}
        <div className="absolute top-2 right-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
            style={{
              background: COLORS.light,
              color: COLORS.text,
            }}
            onClick={(e) =>
              handleAddToCart(e, item._id, item?.price?.[0]?.unit)
            }
            disabled={adding}>
            {adding ? (
              <FaSpinner className="animate-spin text-xs" />
            ) : (
              <FaPlus className="text-xs" />
            )}
          </button>
        </div>

        {/* View details */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 text-white text-sm px-3 py-1 rounded-full flex items-center">
            <FaEye className="mr-1 text-xs" /> View details
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col p-3 flex-1">
        <h2
          className="text-sm font-medium mb-1 line-clamp-2 h-10"
          style={{ color: COLORS.text }}>
          {item.name}
        </h2>

        {item?.price?.length > 0 && (
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
              <FaRupeeSign className="text-sm" style={{ color: COLORS.text }} />
              <span
                className="text-base font-bold ml-1"
                style={{ color: COLORS.text }}>
                {item?.price?.[0]?.price?.toFixed(2)}
              </span>
              <span
                className="ml-1 text-xs font-medium"
                style={{ color: COLORS.textAlt }}>
                / {item?.price?.[0]?.unit}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
