import React, { useState, useMemo, useCallback } from "react";
import { Heart, Check } from "lucide-react";
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

  // ✅ Validate + normalize incoming product data
  const validatedProduct = useMemo(() => {
    if (!product?.id) return null;

    const derivedBadge =
      product.badge ||
      (product.isBestSeller && "Bestseller") ||
      (product.isNewArrival && "New") ||
      (product.isTrending && "Trending") ||
      (product.isFeatured && "Featured") ||
      null;

    // colors is optional — plenty of products (accessories, one-color
    // items) legitimately have none. Keep it as [] rather than undefined
    // so downstream code can always safely check .length.
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    return {
      id: product.id,
      name: product.name || "Unnamed Product",
      slug: product.slug || product.id,
      price: product.price ?? 0,
      originalPrice: product.originalPrice ?? product.price ?? 0,
      category: product.category || "General",
      sku: product.sku || `SKU-${product.id}`,
      banner: product.image || product.banner || product.images?.[0],
      hoverImage: product.hoverImage || null,
      images: product.images || [],
      badge: derivedBadge,
      colors, // [] if the product has no color options
      sizes, // [] if the product has no size options
      hasColors: colors.length > 0,
      hasSizes: sizes.length > 0,
    };
  }, [product]);

  // ⚠️ Hooks must run unconditionally, on every render — never after an
  // early return, or React throws / desyncs state across renders.
  const {
    isWishlisted,
    toggleWishlist,
    loading: wishlistLoading,
  } = useWishlist();
  const { addToCart, syncing: cartSyncing } = useCart();
  const navigate = useNavigate();

  const isLiked = useMemo(
    () => (validatedProduct ? isWishlisted(validatedProduct.id) : false),
    [isWishlisted, validatedProduct],
  );

  const handleNavigate = useCallback(() => {
    if (!validatedProduct) return;
    navigate(`/product/${validatedProduct.slug}`);
  }, [navigate, validatedProduct]);

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      if (wishlistLoading || !validatedProduct) return;
      toggleWishlist(validatedProduct.id);
    },
    [wishlistLoading, toggleWishlist, validatedProduct],
  );

  const formatPrice = (price) => priceFormatter.format(price || 0);

  // Placeholder for invalid product — rendered AFTER all hooks above.
  if (!validatedProduct) {
    console.warn("⚠️ ProductCard: Missing product.id");
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <p className="text-xs text-gray-500">Product unavailable</p>
      </div>
    );
  }

  const mainImage = validatedProduct.banner || "/placeholder-image.jpg";
  const hoverImage =
    validatedProduct.hoverImage || validatedProduct.images[1] || mainImage;

  const discount =
    validatedProduct.originalPrice <= validatedProduct.price
      ? 0
      : Math.round(
          ((validatedProduct.originalPrice - validatedProduct.price) /
            validatedProduct.originalPrice) *
            100,
        );

  // Builds a stable variant key. Falls back gracefully when a product
  // doesn't have color and/or size options, so "no color" products
  // don't end up with a bogus "-default" or "-undefined" suffix baked
  // into every order line.
  const buildVariantId = (size, color) => {
    const parts = [];
    if (validatedProduct.hasSizes) parts.push(size || "onesize");
    if (validatedProduct.hasColors) parts.push(color?.name || "default");
    return parts.length ? parts.join("-") : "standard";
  };

  /* ✅ ADD TO CART - COMPLETE DATA ONLY */
  /* ✅ ADD TO CART - COMPLETE DATA ONLY */
  const executeAddToCart = async (selectedData) => {
    try {
      // Only trust a real size if this product actually has size options —
      // ignore whatever QuickShopModal sends otherwise, so a sizeless
      // product can never end up with a bogus "M"/"L"/etc baked in.
      const selectedSize = validatedProduct.hasSizes
        ? selectedData.size || "onesize"
        : "onesize";
      // Only attach a color if this product actually has color options —
      // otherwise leave it null so it doesn't look like a real selection.
      const selectedColor = validatedProduct.hasColors
        ? selectedData.color || null
        : null;

      const cartItem = {
        productId: validatedProduct.id,
        name: validatedProduct.name,
        price: validatedProduct.price,
        originalPrice: validatedProduct.originalPrice,
        image: mainImage,
        category: validatedProduct.category,
        slug: validatedProduct.slug,
        sku: validatedProduct.sku,
        selectedSize,
        selectedColor, // { name, hex } or null
        variantId: buildVariantId(selectedSize, selectedColor),
        quantity: selectedData.quantity || 1,
      };

      // If this product HAS colors, a color must actually be picked —
      // otherwise warehouse can't tell which variant to pack.
      if (validatedProduct.hasColors && !selectedColor) {
        setNotification({
          show: true,
          message: "Please select a color",
          type: "error",
        });
        return;
      }

      const requiredFields = [
        "productId",
        "name",
        "price",
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

      const selectedSize = validatedProduct.hasSizes
        ? selectedData.size || "onesize"
        : "onesize";

      const selectedColor = validatedProduct.hasColors
        ? selectedData.color || null
        : null;

      if (validatedProduct.hasColors && !selectedColor) {
        setNotification({
          show: true,
          message: "Please select a color",
          type: "error",
        });
        return;
      }

      const variantId = buildVariantId(selectedSize, selectedColor);

      const checkoutItems = [
        {
          productId: validatedProduct.id,
          name: validatedProduct.name,
          price: validatedProduct.price,
          originalPrice: validatedProduct.originalPrice,
          image: mainImage,
          category: validatedProduct.category,
          slug: validatedProduct.slug,
          sku: validatedProduct.sku,
          quantity: qty,
          selectedSize,
          selectedColor,
          variantId,
        },
      ];

      setIsQuickShopOpen(false);

      navigate("/checkout/buy-now", {
        state: {
          items: checkoutItems,
        },
      });
    } catch (error) {
      console.error("Buy now error:", error);
      setNotification({
        show: true,
        message: "Could not proceed to checkout",
        type: "error",
      });
    }
  };

  return (
    <>
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
