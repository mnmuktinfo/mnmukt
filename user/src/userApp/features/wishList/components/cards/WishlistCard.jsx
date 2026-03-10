import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";

export const WishlistCard = ({ product, showNotification, onMoveToCart }) => {
  const { removeFromWishlist } = useWishlist();

  // Stock status
  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Price & Discount
  const price = Number(product.price);
  const originalPrice = Number(product.originalPrice || product.price);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Remove handler
  const handleRemove = async () => {
    try {
      await removeFromWishlist(product.id);
      showNotification("Item removed from wishlist", "success");
    } catch (err) {
      showNotification("Failed to remove item", "error");
    }
  };

  return (
    <div className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Product Image */}
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block">
          <img
            src={product.images?.[0] || product.banner || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-[250px] md:h-[300px] object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        </Link>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 p-1 rounded-full shadow-lg bg-white/50 hover:bg-red-100 transition z-10">
          <X size={18} />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col grow">
        <Link to={`/product/${product.slug}`} className="grow">
          <h3 className="font-semibold text-sm md:text-base text-gray-800 hover:text-[#FF3F6C] line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-gray-900">
            ₹{price.toLocaleString()}
          </span>
          {discount > 0 && (
            <>
              <span className="line-through text-gray-500 text-sm">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-orange-500 text-sm">({discount}% OFF)</span>
            </>
          )}
        </div>
      </div>

      {/* Move to Bag / Out of Stock */}
      <div className="border-t border-gray-100">
        <button
          onClick={onMoveToCart}
          disabled={!isInStock}
          className={`w-full py-3 text-sm font-semibold uppercase transition rounded-b-lg ${
            isInStock
              ? "text-[#FF3F6C]"
              : "text-gray-500 bg-gray-100 cursor-not-allowed"
          }`}>
          {isInStock ? "MOVE TO BAG" : "OUT OF STOCK"}
        </button>
      </div>
    </div>
  );
};
