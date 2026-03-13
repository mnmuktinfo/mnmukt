import React, { useState } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useWishlist } from "../../features/wishList/context/WishlistContext";
import { useCart } from "../../features/cart/context/CartContext";
import { useNavigate } from "react-router-dom";
import NotificationProduct from "./NotificationProduct";

const ProductCard = ({ product }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const {
    isWishlisted,
    toggleWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const { addToCart, syncing: cartSyncing } = useCart();
  const navigate = useNavigate();

  const isLiked = isWishlisted(product.id);
  const mainImage = product.banner || product.images?.[0];
  const hoverImage = product.images?.[1] || mainImage;

  const formatPrice = (price) => new Intl.NumberFormat("en-IN").format(price);

  const discount =
    product.originalPrice && product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart({
        id: product.id,
        selectedSize: "",
        selectedQuantity: 1,
      });
      setIsAdded(true);
      setNotification({
        show: true,
        message: "Added to your bag",
        type: "success",
      });
      setTimeout(() => setIsAdded(false), 2200);
    } catch {
      setNotification({
        show: true,
        message: "Could not add to bag",
        type: "error",
      });
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <>
      {notification.show && (
        <NotificationProduct
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      {/* Main Card Container - Borderless, clean background */}
      <div
        className="group flex flex-col w-full font-sans cursor-pointer relative"
        onClick={() => navigate(`/product/${product.slug}`)}>
        {/* ── Image Shell (Sharp Corners) ── */}
        <div className="relative w-full aspect-3/4 bg-[#f3f3f3] overflow-hidden">
          {/* Shimmer Placeholder */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
          )}

          {/* Primary Image */}
          <img
            src={mainImage}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0 relative z-0"
          />

          {/* Hover Image */}
          <img
            src={hoverImage}
            alt={`${product.name} alternate`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-0"
          />

          {/* Top Left Badge (e.g. | OVERSIZED FIT) */}
          {(product.badge || product.fit) && (
            <div className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-bold text-gray-900 uppercase tracking-widest bg-white/50 backdrop-blur-sm px-1.5 py-0.5 z-10">
              | {product.badge || product.fit}
            </div>
          )}

          {/* Bottom Left Badge (e.g. PREMIUM HEAVY GAUGE FABRIC) */}
          {product.fabricBadge && (
            <div className="absolute bottom-2 left-2 bg-[#2d2d2d] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-1 z-10 max-w-[80%] leading-tight">
              {product.fabricBadge}
            </div>
          )}

          {/* Top Right Wishlist Button (Translucent Gray Circle) */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label="Toggle wishlist"
            className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/15 backdrop-blur-md flex items-center justify-center hover:bg-black/25 transition-all z-10 disabled:opacity-60 active:scale-90">
            <Heart
              size={15}
              strokeWidth={isLiked ? 0 : 2}
              className={`transition-colors ${
                isLiked
                  ? "fill-[#007673] text-[#007673]"
                  : "text-white fill-transparent"
              }`}
            />
          </button>

          {/* Quick Add to Bag Slider (Hidden by default, slides up on hover) */}
          <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <button
              onClick={handleAddToCart}
              disabled={cartSyncing || isAdded}
              className={`w-full py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                isAdded
                  ? "bg-[#007673] text-white"
                  : "bg-white/95 backdrop-blur-md text-gray-900 hover:bg-gray-900 hover:text-white"
              }`}>
              {isAdded ? (
                <>
                  <Check size={14} strokeWidth={3} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={14} strokeWidth={2} /> Quick Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Text Info Area (Aligns with image) ── */}
        <div className="pt-3 flex flex-col items-start text-left">
          {/* Title */}
          <h3 className="text-[12px] sm:text-[13px] font-bold text-gray-900 truncate w-full">
            {product.name}
          </h3>

          {/* Category */}
          <p className="text-[11px] sm:text-[12px] text-gray-500 mt-[2px] truncate w-full">
            {product.category || "Apparel"}
          </p>

          {/* Pricing */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[12px] sm:text-[13px] font-bold text-gray-900">
              ₹ {formatPrice(product.price)}
            </span>

            {discount > 0 && (
              <>
                <span className="text-[11px] text-gray-400 line-through">
                  ₹ {formatPrice(product.originalPrice)}
                </span>
                <span className="text-[10px] font-bold text-orange-500 tracking-wide">
                  ({discount}% OFF)
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
