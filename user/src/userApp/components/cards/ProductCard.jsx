import React, { useState, useMemo, useCallback } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useWishlist } from "../../features/wishList/context/WishlistContext";
import { useCart } from "../../features/cart/context/CartContext";
import { useNavigate } from "react-router-dom";
import NotificationProduct from "./NotificationProduct";

/* formatter created once */
const priceFormatter = new Intl.NumberFormat("en-IN");

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

  /* memoized liked state */
  const isLiked = useMemo(
    () => isWishlisted(product.id),
    [isWishlisted, product.id],
  );

  const mainImage = product.banner || product.images?.[0];
  const hoverImage = product.images?.[1] || mainImage;

  const discount = useMemo(() => {
    if (!product.originalPrice || !product.price) return 0;

    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100,
    );
  }, [product.originalPrice, product.price]);

  const formatPrice = (price) => priceFormatter.format(price);

  /* navigation handler */
  const handleNavigate = useCallback(() => {
    navigate(`/product/${product.slug || product.id}`);
  }, [navigate, product.slug, product.id]);

  /* add to cart */
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

  /* wishlist toggle */
  const handleWishlist = (e) => {
    e.stopPropagation();

    if (wishlistLoading) return;

    toggleWishlist(product.id);
  };

  return (
    <>
      {notification.show && (
        <NotificationProduct
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotification((prev) => ({
              ...prev,
              show: false,
            }))
          }
        />
      )}

      {/* Main Card */}
      <div
        className="group flex flex-col w-full font-sans cursor-pointer relative"
        onClick={handleNavigate}>
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] bg-[#F9F5F6] overflow-hidden border border-gray-100/50">
          {/* Skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse z-0" />
          )}

          {/* Main Image */}
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />

          {/* Hover Image */}
          <img
            src={hoverImage}
            alt={`${product.name} alternate`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100"
          />

          {/* Badge */}
          {(product.badge || product.fit) && (
            <div className="absolute top-3 left-3 text-[9px] sm:text-[10px] font-bold text-white bg-[#da127d] uppercase tracking-[0.15em] px-2.5 py-1.5 shadow-sm z-10">
              {product.badge || product.fit}
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label="Toggle wishlist"
            className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-[#da127d] transition-colors duration-300 z-10 disabled:opacity-60 shadow-sm group/heart">
            <Heart
              size={16}
              strokeWidth={isLiked ? 0 : 1.5}
              className={`transition-colors duration-300 ${
                isLiked
                  ? "fill-[#da127d] text-[#da127d] group-hover/heart:fill-white group-hover/heart:text-white"
                  : "text-gray-900 group-hover/heart:text-white fill-transparent"
              }`}
            />
          </button>

          {/* Quick Add */}
          <div className="absolute bottom-0 left-0 w-full lg:translate-y-full lg:group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
            <button
              onClick={handleAddToCart}
              disabled={cartSyncing || isAdded}
              className={`w-full py-3.5 sm:py-4 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors duration-300 ${
                isAdded
                  ? "bg-[#da127d] text-white"
                  : "bg-white/95 backdrop-blur-md text-gray-900 hover:bg-[#da127d] hover:text-white"
              }`}>
              {isAdded ? (
                <>
                  <Check size={15} strokeWidth={2.5} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={15} strokeWidth={1.5} /> Quick Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-4 pb-2 flex flex-col items-center text-center px-1">
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-gray-900 uppercase tracking-widest truncate w-full transition-colors duration-300 group-hover:text-[#da127d]">
            {product.name}
          </h3>

          <p className="text-[11px] sm:text-[12px] text-gray-500 italic font-serif mt-1.5 truncate w-full">
            {product.category || "Premium Collection"}
          </p>

          <div className="flex items-center justify-center gap-2.5 mt-2.5">
            <span className="text-[13px] sm:text-[14px] font-medium text-gray-900">
              ₹ {formatPrice(product.price)}
            </span>

            {discount > 0 && (
              <>
                <span className="text-[11px] sm:text-[12px] text-gray-400 line-through">
                  ₹ {formatPrice(product.originalPrice)}
                </span>

                <span className="text-[10px] sm:text-[11px] font-bold text-[#da127d] tracking-wider">
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

export default React.memo(ProductCard);
