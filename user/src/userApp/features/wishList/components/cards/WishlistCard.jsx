import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";

const priceFormatter = new Intl.NumberFormat("en-IN");

const WishlistCardComponent = ({ product, showNotification, onMoveToCart }) => {
  const { removeFromWishlist } = useWishlist();

  const isInStock = product.stock > 0;
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Format date to match image "14 Mar 2026"
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(product.addedAt ? new Date(product.addedAt) : new Date());

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromWishlist(product.id);
    } catch {
      showNotification("Failed to remove item", "error");
    }
  };

  return (
    <div className="flex flex-col bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300 relative h-full">
      {/* ── Remove Button (Floating Top Right) ── */}
      <button
        onClick={handleRemove}
        aria-label="Remove from wishlist"
        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-all duration-200 z-10">
        <X size={16} strokeWidth={2} />
      </button>

      {/* ── Top Section: Title & Date (Matches Image) ── */}
      <div className="px-4 pt-5 pb-4 flex flex-col gap-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-[15px] font-normal text-gray-800 line-clamp-1 hover:text-[#da127d] transition-colors">
            {product.name}
          </h3>
        </Link>
        <span className="text-[13px] text-gray-400">{formattedDate}</span>
      </div>

      {/* ── Bottom Section: Image ── */}
      <Link
        to={`/product/${product.slug}`}
        className="block relative aspect-4/5 bg-gray-50 overflow-hidden shrink-0">
        <img
          loading="lazy"
          decoding="async"
          src={product.banner || product.images?.[0] || "/placeholder.jpg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      </Link>

      {/* ── Functional Section: Price & CTA (Added below image for e-commerce functionality) ── */}
      <div className="p-4 flex flex-col gap-3 mt-auto border-t border-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-[15px]">
            ₹{priceFormatter.format(price)}
          </span>
          {discount > 0 && (
            <span className="line-through text-gray-400 text-xs">
              ₹{priceFormatter.format(originalPrice)}
            </span>
          )}
        </div>

        <button
          onClick={onMoveToCart}
          disabled={!isInStock}
          className={`w-full py-2.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 ${
            isInStock
              ? "border border-[#da127d] text-[#da127d] hover:bg-[#da127d] hover:text-white"
              : "border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
          }`}>
          {isInStock ? "Move to Bag" : "Sold Out"}
        </button>
      </div>
    </div>
  );
};

export const WishlistCard = React.memo(WishlistCardComponent);
