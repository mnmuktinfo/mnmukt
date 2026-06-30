import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Heart, Check, X, Minus, Plus } from "lucide-react";
import { useWishlist } from "../../features/wishList/context/WishlistContext";
import { useCart } from "../../features/cart/context/CartContext";
import { useNavigate } from "react-router-dom";
import NotificationProduct from "./NotificationProduct";
import QuickShopModal from "./QuickShopModal";

const priceFormatter = new Intl.NumberFormat("en-IN");

/* =========================================================
   PRODUCT CARD - WITH COMPLETE DATA VALIDATION
========================================================= */
const ProductCard = ({ product }) => {
  const [isQuickShopOpen, setIsQuickShopOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // ✅ Validate product data on mount
  const validatedProduct = useMemo(() => {
    if (!product?.id) {
      console.warn("⚠️ ProductCard: Missing product.id");
      return null;
    }

    return {
      id: product.id,
      name: product.name || "Unnamed Product",
      slug: product.slug || product.id,
      price: product.price ?? 0,
      originalPrice: product.originalPrice ?? product.price ?? 0,
      category: product.category || "General",
      sku: product.sku || `SKU-${product.id}`, // ✅ Generate if missing
      banner: product.banner || product.images?.[0],
      images: product.images || [],
      badge: product.badge || null,
    };
  }, [product]);

  // If product data is invalid, don't render
  if (!validatedProduct) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <p className="text-xs text-gray-500">Product unavailable</p>
      </div>
    );
  }

  const {
    isWishlisted,
    toggleWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const { addToCart, syncing: cartSyncing } = useCart();
  const navigate = useNavigate();

  const isLiked = useMemo(
    () => isWishlisted(validatedProduct.id),
    [isWishlisted, validatedProduct.id],
  );

  const mainImage = validatedProduct.banner || "/placeholder-image.jpg";
  const hoverImage = validatedProduct.images[1] || mainImage;

  const discount = useMemo(() => {
    if (validatedProduct.originalPrice <= validatedProduct.price) return 0;
    return Math.round(
      ((validatedProduct.originalPrice - validatedProduct.price) /
        validatedProduct.originalPrice) *
        100,
    );
  }, [validatedProduct.originalPrice, validatedProduct.price]);

  const formatPrice = (price) => priceFormatter.format(price || 0);

  const handleNavigate = useCallback(() => {
    navigate(`/product/${validatedProduct.slug}`);
  }, [navigate, validatedProduct.slug]);

  /* ✅ ADD TO CART - COMPLETE DATA ONLY */
  const executeAddToCart = async (selectedData) => {
    try {
      // ✅ Ensure all required fields exist before adding to cart
      const cartItem = {
        productId: validatedProduct.id,
        name: validatedProduct.name,
        unitPrice: validatedProduct.price,
        originalPrice: validatedProduct.originalPrice,
        image: mainImage,
        category: validatedProduct.category,
        slug: validatedProduct.slug,
        sku: validatedProduct.sku,
        selectedSize: selectedData.size || "onesize",
        quantity: selectedData.quantity || 1,
      };

      // Validate required fields
      const requiredFields = [
        "productId",
        "name",
        "unitPrice",
        "image",
        "slug",
        "sku",
      ];
      const missingFields = requiredFields.filter((field) => !cartItem[field]);

      if (missingFields.length > 0) {
        console.error("❌ Missing required fields:", missingFields, cartItem);
        setNotification({
          show: true,
          message: "Product data incomplete. Try refreshing.",
          type: "error",
        });
        return;
      }

      await addToCart(cartItem);

      setIsQuickShopOpen(false);
      setIsAdded(true);
      setNotification({
        show: true,
        message: validatedProduct.name,
        type: "cart",
      });
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Add to cart error:", error);
      setNotification({
        show: true,
        message: "Could not add to bag",
        type: "error",
      });
    }
  };

  /* ✅ BUY NOW - COMPLETE DATA ONLY */
  const executeBuyNow = (selectedData) => {
    try {
      const qty = selectedData.quantity || 1;
      const variant = selectedData.size || "onesize";

      // ✅ Wrap in items array for consistency
      const checkoutItems = [
        {
          productId: validatedProduct.id,
          name: validatedProduct.name,
          unitPrice: validatedProduct.price,
          originalPrice: validatedProduct.originalPrice,
          image: mainImage,
          category: validatedProduct.category,
          slug: validatedProduct.slug,
          sku: validatedProduct.sku,
          quantity: qty,
          selectedSize: variant,
        },
      ];

      setIsQuickShopOpen(false);

      navigate(
        `/${validatedProduct.slug}?variant=${encodeURIComponent(variant)}&qty=${qty}`,
        {
          state: { items: checkoutItems },
        },
      );
    } catch (error) {
      console.error("Buy now error:", error);
      setNotification({
        show: true,
        message: "Could not proceed to checkout",
        type: "error",
      });
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (wishlistLoading) return;
    toggleWishlist(validatedProduct.id);
  };

  return (
    <>
      {/* Quick Shop Modal Portal */}
      {isQuickShopOpen && (
        <QuickShopModal
          product={validatedProduct}
          image={mainImage}
          formatPrice={formatPrice}
          onClose={() => setIsQuickShopOpen(false)}
          onAddToCart={(data) => executeAddToCart(data)}
          onBuyNow={(data) => executeBuyNow(data)}
          cartSyncing={cartSyncing}
          isLiked={isLiked}
          onToggleWishlist={handleWishlist}
          onViewDetails={() => {
            setIsQuickShopOpen(false);
            handleNavigate();
          }}
        />
      )}

      {/* Notifications */}
      {notification.show && (
        <NotificationProduct
          message={notification.message}
          type={notification.type}
          product={{
            img: mainImage,
            name: validatedProduct.name,
            price: formatPrice(validatedProduct.price),
          }}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Main Card */}
      <div
        className="group flex flex-col w-full font-sans cursor-pointer relative"
        onClick={handleNavigate}>
        <div className="relative w-full aspect-[3/4] bg-[#F9F5F6] overflow-hidden border border-gray-100/50">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse z-0" />
          )}

          <img
            src={mainImage}
            alt={validatedProduct.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />

          <img
            src={hoverImage}
            alt={`${validatedProduct.name} alternate`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100"
          />

          {validatedProduct.badge && (
            <div className="absolute top-3 left-3 text-[9px] sm:text-[10px] font-bold text-white bg-[#da127d] uppercase tracking-[0.15em] px-2.5 py-1.5 shadow-sm z-10">
              {validatedProduct.badge}
            </div>
          )}

          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
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

          {/* Quick Shop Button */}
          <div className="absolute bottom-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickShopOpen(true);
              }}
              disabled={cartSyncing || isAdded}
              aria-label="Quick Shop"
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${
                isAdded
                  ? "bg-[#da127d] text-white"
                  : "bg-white text-gray-900 hover:bg-[#da127d] hover:text-white"
              }`}>
              {isAdded ? (
                <Check size={16} strokeWidth={2.5} />
              ) : (
                <span className="text-lg font-bold">+</span>
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 pb-3 flex flex-col items-center text-center px-1">
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-gray-900 uppercase tracking-widest truncate w-full transition-colors duration-300 group-hover:text-[#da127d]">
            {validatedProduct.name}
          </h3>
          <p className="text-[11px] sm:text-[12px] text-gray-500 italic font-serif mt-1.5 truncate w-full">
            {validatedProduct.category}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2.5">
            <span className="text-[14px] font-semibold text-gray-900">
              ₹{formatPrice(validatedProduct.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-[12px] text-gray-400 line-through">
                  ₹{formatPrice(validatedProduct.originalPrice)}
                </span>
                <span className="text-[11px] font-semibold text-[#da127d]">
                  {discount}% OFF
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
