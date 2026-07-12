import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useShippingServiceability } from "../features/orders/hooks/useShippingServiceability";

// ─── Heroicons (outline) ─────────────────────────────────────────────────────
import {
  HeartIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon,
  ArrowPathIcon,
  ShareIcon,
  StarIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
} from "@heroicons/react/24/solid";

// ─── App Hooks & Components ───────────────────────────────────────────────────
import { useProducts } from "../features/product/hook/useProducts";
import { useWishlist } from "../features/wishList/context/WishlistContext";
import { useCart } from "../features/cart/context/CartContext";
import { useAuth } from "../features/auth/context/UserContext";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductBottomBar from "../features/account/components/bars/ProductBottomBar";
import LoginPoup from "../components/pop-up/LoginPoup";
import NotificationProduct from "../components/cards/NotificationProduct";
import CustomerReviews from "../components/product/CustomerReviews";
import RelatedProducts from "../components/product/RelatedProducts";

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${new Intl.NumberFormat("en-IN").format(Number(n) || 0)}`;

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-gray-100 border-t-[#da127d] rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium tracking-wide">
        Loading product…
      </p>
    </div>
  </div>
);

// ─── 404 / Error State ────────────────────────────────────────────────────────
const ErrorState = ({ navigate }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-5 bg-white">
    <div
      className="text-[120px] font-black leading-none select-none"
      style={{ color: "#f3f4f6" }}>
      404
    </div>
    <h2 className="text-3xl font-bold text-gray-900 -mt-6">
      Product not found
    </h2>
    <p className="text-gray-500 max-w-sm text-[15px]">
      We couldn't find what you're looking for. Let's get you back on track.
    </p>
    <button
      onClick={() => navigate("/")}
      className="mt-2 inline-flex items-center gap-2 px-8 py-3 bg-[#da127d] text-white font-bold tracking-widest text-sm hover:bg-[#c20d6c] active:scale-95 transition-all rounded-sm">
      <ArrowLeftIcon className="w-4 h-4" />
      BACK TO HOME
    </button>
  </div>
);

// ─── Shirt Icon (Heroicons doesn't have "shirt") — inline SVG ────────────────
const ShirtIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 3H5.25A2.25 2.25 0 003 5.25v13.5A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V5.25A2.25 2.25 0 0018.75 3H15M9 3a3 3 0 006 0M9 3H15"
    />
  </svg>
);

// ─── Refresh/Exchange Icon ────────────────────────────────────────────────────
const ExchangeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
    />
  </svg>
);

// ─── Notification Toast ───────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => {
  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${colors[type] || colors.info}`}>
      {type === "success" && (
        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { getProductBySlug, getProductsByCollection } = useProducts();
  const { addToCart, cart } = useCart();
  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  // ─── State ────────────────────────────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeOffer, setActiveOffer] = useState(0);
  const [pincode, setPincode] = useState("");
  const {
    shippingInfo,
    shippingLoading,
    shippingError,
    pinStatus,
    checkPincode: verifyPincode,
    reset: resetShipping,
  } = useShippingServiceability();
  const [openSection, setOpenSection] = useState("Description");
  const [copied, setCopied] = useState(false);

  const wishlisted = product ? isWishlisted(product.id) : false;

  // ─── Fetch Product ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    setFetchError(false);
    setProduct(null);
    setRelatedProducts([]);
    setSelectedSize("");
    setQuantity(1);
    setActiveImageIndex(0);
    setActiveOffer(0);
    setPincode("");
    setOpenSection("Description");
    resetShipping();

    const fetchProduct = async () => {
      try {
        const data = await getProductBySlug(slug);
        if (cancelled) return;
        if (data) {
          setProduct(data);
          // 👈 default sizeless products to "onesize" so downstream cart/
          // checkout logic (which uses the same convention) always has a
          // non-empty size key to build cartKey / variant from.
          setSelectedSize(data.sizes?.length ? data.sizes[0] : "onesize");
        } else {
          setFetchError(true);
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => (cancelled = true);
  }, [slug, getProductBySlug]);

  // ─── Fetch Related Products ────────────────────────────────────────────────
  useEffect(() => {
    if (!product?.collectionTypes?.length) return;
    let cancelled = false;

    const fetchRelated = async () => {
      try {
        const data = await getProductsByCollection(product.collectionTypes, 9);
        if (!cancelled && data) {
          setRelatedProducts(
            data.filter((p) => p.id !== product.id).slice(0, 8),
          );
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    };

    fetchRelated();
    return () => (cancelled = true);
  }, [product, getProductsByCollection]);

  // ─── Notification Helper ───────────────────────────────────────────────────
  const notify = useCallback((type, message) => {
    setNotification({ type, message });
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleWishlist = () => {
    if (!product) return;
    if (!isLoggedIn) return setShowLoginModal(true);
    const wasWishlisted = isWishlisted(product.id);
    toggleWishlist(product.id);
    notify(
      wasWishlisted ? "info" : "success",
      wasWishlisted ? "Removed from wishlist" : "Saved to wishlist",
    );
  };

  // ─── Add to Cart (persists to the real cart) ───────────────────────────────
  const handleAddToCart = useCallback(async () => {
    if (product.sizes?.length > 0 && !selectedSize)
      return notify("error", "Please select a size");

    setIsAdding(true);
    try {
      await addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image || product.images?.[0] || "",
        categoryId: product.categoryId,
        brand: product.brand,
        slug: product.slug,
        sku: product.sku,
        selectedSize,
        quantity,
      });
      notify("success", "Added to bag!");
    } catch {
      notify("error", "Something went wrong. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }, [product, selectedSize, quantity, addToCart, notify]);

  // ─── Buy Now (bypasses the cart entirely, goes straight to SingleItemCheckout) ──
  const handleBuyNow = useCallback(() => {
    if (product.sizes?.length > 0 && !selectedSize)
      return notify("error", "Please select a size");

    navigate("/checkout/buy-now", {
      state: {
        items: [
          {
            productId: product.id,
            sku: product.sku,
            slug: product.slug,
            name: product.name,
            image: product.image || product.images?.[0] || "",
            price: product.price,
            originalPrice: product.originalPrice,
            stock: product.stock,
            selectedSize,
            quantity,
            category: product.categoryId,
            brand: product.brand,
          },
        ],
        source: "buy_now",
      },
    });
  }, [product, selectedSize, quantity, navigate, notify]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled share — ignore
    }
  };

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (fetching) return <LoadingSkeleton />;
  if (fetchError || !product) return <ErrorState navigate={navigate} />;

  // ─── Derived Data ─────────────────────────────────────────────────────────
  // 👈 fixed: product.banner doesn't exist on normalize() output — the field is `image`
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const isOutOfStock = product.stock === 0;
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const variantKey = `${product.id}_${selectedSize}`;
  const cartItems = cart || []; // 👈 fixed: cart is already the array, not { cart: [...] }
  const alreadyInCart = cartItems.some((item) => item.cartKey === variantKey);

  const maxQty = Math.min(product.stock || 10, 10);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-24 md:pb-0 md:mt-5">
      <Helmet>
        <title>{product.seo?.metaTitle || `${product.name} | Mnmukt`}</title>
        <meta
          name="description"
          content={
            product.seo?.metaDescription ||
            product.description ||
            `Buy ${product.name} at Mnmukt.`
          }
        />
        {product.seo?.metaKeywords && (
          <meta name="keywords" content={product.seo.metaKeywords} />
        )}
      </Helmet>

      {/* ── Toast Notification ── */}
      {notification && (
        <Toast {...notification} onClose={() => setNotification(null)} />
      )}

      {/* ── Breadcrumbs ── */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-[1440px] mx-auto px-4 md:px-8 py-3">
        <ol className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-gray-400 capitalize tracking-wide flex-wrap">
          {[
            { label: "Home", onClick: () => navigate("/") },
            {
              label: product.categoryId || "Clothing", // 👈 fixed: was product.category
              onClick: () => navigate(`/category/${product.categoryId}`),
            },
            {
              label: product.brand || "Brand",
              onClick: () =>
                navigate(
                  `/brand/${product.brand?.toLowerCase().replace(/\s/g, "-")}`,
                ),
            },
          ].map(({ label, onClick }, i) => (
            <React.Fragment key={i}>
              <li>
                <button
                  onClick={onClick}
                  className="hover:text-gray-900 transition-colors">
                  {label}
                </button>
              </li>
              <li aria-hidden>/</li>
            </React.Fragment>
          ))}
          <li
            className="text-gray-900 font-semibold truncate max-w-[160px] sm:max-w-xs"
            aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 pb-16 mt-2 sm:mt-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          {/* ── LEFT: Image Gallery ── */}
          <div className="w-full lg:w-[55%]">
            <ProductImageGallery
              images={allImages}
              activeIndex={activeImageIndex}
              onImageChange={setActiveImageIndex}
              productName={product.name}
            />
          </div>

          {/* ── RIGHT: Details Panel ── */}
          <div className="w-full lg:w-[45%] font-sans text-gray-900">
            <div className="lg:sticky lg:top-24 pb-10">
              {/* ── 1. Category Pill ── */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 bg-[#e2e2e2] text-gray-800 px-3 py-1 rounded-[4px] text-[13px] font-medium tracking-wide">
                  <TagIcon className="w-3.5 h-3.5 text-[#e6007e]" />
                  {product.categoryId || "Tops"} {/* 👈 fixed */}
                </span>
              </div>

              {/* ── 1.5 Sold / Tag Badges ── */}
              {(product.soldCount > 0 || product.tags?.length > 0) && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {product.soldCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 bg-pink-50 text-[#e6007e] px-3 py-1 rounded-full text-[12px] font-semibold">
                      <EyeIcon className="w-3.5 h-3.5" />
                      {Math.floor(product.soldCount / 10) * 10}+ Sold
                    </span>
                  )}
                  {product.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[12px] font-medium">
                      🔥 {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* ── 2. Title & Share ── */}
              <div className="flex justify-between items-start mb-2">
                <div className="pr-4 flex-1 min-w-0">
                  {product.brand && (
                    <p className="text-[12px] text-gray-500 font-bold mb-1 tracking-[0.12em] uppercase">
                      {product.brand}
                    </p>
                  )}
                  <h1 className="text-[22px] sm:text-[26px] font-normal leading-snug tracking-tight text-gray-900">
                    {product.name}
                  </h1>
                </div>
                <button
                  onClick={handleShare}
                  title={copied ? "Link copied!" : "Share product"}
                  className="flex-shrink-0 p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Share">
                  {copied ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <ShareIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* ── 3. Star Rating ── */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarSolid key={s} className="w-4 h-4 text-[#e6007e]" />
                  ))}
                </div>
                <span className="text-[14px] text-gray-600">
                  {product.totalReviews || 0} reviews
                </span>
              </div>

              {/* ── 4. Pricing ── */}
              <div className="flex items-baseline gap-2.5 flex-wrap mb-1">
                <span className="text-[22px] font-medium text-gray-900">
                  {fmt(price)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-[15px] text-gray-500 line-through">
                      {fmt(originalPrice)}
                    </span>
                    <span className="text-[14px] font-bold text-[#e6007e]">
                      ({discount}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="text-[13px] text-gray-500 font-medium mb-8">
                Inclusive of all taxes
              </p>

              {/* ── 5. Available Offers (Carousel) ── */}
              {product.offers && product.offers.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[15px] text-gray-700 mb-3">
                    Available Offers
                  </h3>

                  <div className="bg-[#f8f8f8] px-4 py-3.5 rounded flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <svg
                        className="w-8 h-8 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2L14.8 4.7L18.7 4.2L19.9 8L23.4 9.9L21.8 13.5L23.4 17.1L19.9 19L18.7 22.8L14.8 22.3L12 25L9.2 22.3L5.3 22.8L4.1 19L0.6 17.1L2.2 13.5L0.6 9.9L4.1 8L5.3 4.2L9.2 4.7L12 2Z"
                          fill="black"
                        />
                        <text
                          x="12"
                          y="16.5"
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle">
                          %
                        </text>
                      </svg>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-gray-900 truncate">
                          {product.offers[activeOffer]?.title}
                        </p>
                        <p className="text-[13px] text-gray-500 mt-0.5 truncate">
                          {product.offers[activeOffer]?.description}
                        </p>
                      </div>
                    </div>

                    {product.offers.length > 1 && (
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-500 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveOffer(
                              (i) =>
                                (i - 1 + product.offers.length) %
                                product.offers.length,
                            )
                          }
                          className="p-1 hover:text-gray-900 transition-colors"
                          aria-label="Previous offer">
                          <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <span className="tabular-nums">
                          {activeOffer + 1} / {product.offers.length}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveOffer(
                              (i) => (i + 1) % product.offers.length,
                            )
                          }
                          className="p-1 hover:text-gray-900 transition-colors"
                          aria-label="Next offer">
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 6. Color Variants ── */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <span className="text-[14px] text-gray-800 mb-3 block">
                    Color Family
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color, idx) => (
                      <div
                        key={idx}
                        title={color.name}
                        className="flex flex-col items-center gap-1 group">
                        <div className="w-9 h-9 rounded-full border border-gray-200 group-hover:border-[#e6007e] transition-colors p-[2px]">
                          <div
                            className="w-full h-full rounded-full overflow-hidden"
                            style={{ backgroundColor: color.hex || "#ddd" }}>
                            {color.image && (
                              <img
                                src={color.image}
                                alt={color.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-gray-500 truncate max-w-[50px] group-hover:text-[#e6007e] transition-colors text-center">
                          {color.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* NOTE: color swatches were previously wrapped in <a href={`/product/${color.slug}`}>,
                  but neither the admin form nor normalize() ever attaches an id or slug to an
                  individual color entry — colors are just { name, image, hex } on THIS product,
                  not separate linkable products. Rendered as static swatches instead until/unless
                  colors are modeled as links to sibling product documents. */}

              {/* ── 7. Size Selector ── */}
              {product.sizes?.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-[15px] text-gray-800">
                      Size:{" "}
                      <span className="font-semibold">
                        {selectedSize || "Select"}
                      </span>
                    </span>
                    <button className="flex items-center gap-1.5 text-[14px] text-gray-900 hover:text-[#e6007e] transition-colors underline underline-offset-2 ml-2">
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      Size chart
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[46px] h-[42px] px-2 rounded-[4px] flex items-center justify-center text-[13px] transition-all duration-150 focus:outline-none ${
                          selectedSize === s
                            ? "bg-black text-white border border-black font-semibold"
                            : "bg-white text-gray-900 border border-gray-900 font-normal hover:bg-gray-50"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {!selectedSize && (
                    <p className="text-[12px] text-red-500 mt-2">
                      * Please select a size to continue
                    </p>
                  )}
                </div>
              )}

              {/* ── 8. Pincode Delivery Box ── */}
              <div className="mb-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-xl overflow-hidden max-w-[420px] font-sans">
                <div className="bg-black text-white text-[13px] font-semibold text-center py-2.5">
                  Enter Pincode to Check The Delivery Date
                </div>

                <div className="p-4 sm:p-5 bg-white">
                  <p className="text-[14px] text-gray-800 mb-4">
                    Estimated Delivery
                  </p>

                  {shippingInfo && !shippingError ? (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col w-[120px]">
                        <div className="flex items-center gap-2 border-b border-black pb-1.5">
                          <div className="border border-gray-200 rounded text-gray-400 p-[3px] flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <span className="text-[14px] text-gray-500">
                            {pincode}
                          </span>
                        </div>
                        <button
                          onClick={() => setPincode("")}
                          className="text-left text-[12.5px] font-bold text-black mt-2.5 hover:opacity-70 transition-opacity">
                          Change pincode
                        </button>
                      </div>

                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2 border-b border-black pb-1.5">
                          <div className="border border-gray-200 rounded text-gray-400 p-[3px] flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round">
                              <rect
                                width="18"
                                height="18"
                                x="3"
                                y="4"
                                rx="2"
                                ry="2"
                              />
                              <line x1="16" x2="16" y1="2" y2="6" />
                              <line x1="8" x2="8" y1="2" y2="6" />
                              <line x1="3" x2="21" y1="10" y2="10" />
                              <path d="M8 14h.01" />
                              <path d="M12 14h.01" />
                              <path d="M16 14h.01" />
                              <path d="M8 18h.01" />
                              <path d="M12 18h.01" />
                              <path d="M16 18h.01" />
                            </svg>
                          </div>
                          <span className="text-[14px] text-gray-500">
                            {shippingInfo.deliveryDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between border-b border-black pb-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={pincode}
                          onChange={(e) =>
                            setPincode(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            pincode.length === 6 &&
                            verifyPincode(pincode)
                          }
                          className="flex-1 text-[14px] bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
                          placeholder="Enter Pincode"
                          maxLength={6}
                        />
                        <button
                          onClick={() => verifyPincode(pincode)}
                          disabled={pincode.length !== 6 || shippingLoading}
                          className="text-[13px] font-bold text-black uppercase tracking-wide hover:opacity-70 transition-opacity disabled:opacity-40 px-1">
                          {shippingLoading ? "Checking..." : "Check"}
                        </button>
                      </div>

                      {shippingLoading && (
                        <p className="text-[12px] text-gray-500 mt-2">
                          Checking delivery availability...
                        </p>
                      )}

                      {!shippingLoading && shippingError && (
                        <p className="text-[12px] font-medium text-red-500 mt-2">
                          {shippingError}
                        </p>
                      )}

                      {!shippingLoading &&
                        !shippingError &&
                        pinStatus === "invalid" && (
                          <p className="text-[12px] font-medium text-red-500 mt-2">
                            Not deliverable to this pincode.
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── 8.5 Quantity Selector ── */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[14px] text-gray-800">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-[4px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity">
                    <MinusIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-[14px] font-medium text-gray-900 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase quantity">
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                {!isOutOfStock && product.stock > 0 && product.stock <= 5 && (
                  <span className="text-[12px] text-orange-600 font-medium">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* ── 9. CTA Buttons (single, de-duplicated) ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock || alreadyInCart}
                  className={`flex-1 py-3.5 rounded-[4px] font-bold uppercase tracking-widest text-[13px] transition-all duration-200 border ${
                    alreadyInCart
                      ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                      : isOutOfStock
                        ? "bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-white text-black border-[#e6007e] hover:bg-pink-50"
                  }`}>
                  {isOutOfStock
                    ? "Out of Stock"
                    : alreadyInCart
                      ? "In Bag"
                      : isAdding
                        ? "Adding…"
                        : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isAdding || isOutOfStock}
                  className="flex-1 py-3.5 rounded-[4px] font-bold uppercase tracking-widest text-[13px] bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200">
                  {isOutOfStock ? "Out of Stock" : "Buy Now"}
                </button>

                <button
                  onClick={handleWishlist}
                  className={`sm:w-14 py-3.5 border rounded-[4px] flex items-center justify-center transition-all duration-200 ${
                    wishlisted
                      ? "border-[#e6007e] text-[#e6007e] bg-pink-50"
                      : "border-gray-300 text-gray-900 hover:border-[#e6007e] hover:text-[#e6007e]"
                  }`}
                  aria-label={
                    wishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }>
                  {wishlisted ? (
                    <HeartSolid className="w-4 h-4" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* ── 9.5 PRODUCT HIGHLIGHTS ── */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="mt-8 mb-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {product.highlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-lg">
                        <StarSolid className="w-6 h-6 text-[#da127d] mb-2 opacity-80" />
                        <span className="text-[13px] font-bold text-gray-900 leading-tight mb-1">
                          {hl.title}
                        </span>
                        <span className="text-[11px] text-gray-500 leading-tight">
                          {hl.value}{" "}
                          {/* 👈 fixed: was hl.description, field is `value` */}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 10. PRODUCT INFORMATION ACCORDIONS ── */}
              <div className="mt-8">
                <h2 className="text-[18px] sm:text-[20px] font-medium text-gray-900 mb-5">
                  Product Information
                </h2>
                <div className="border-t border-gray-200">
                  {/* Description Accordion */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() =>
                        setOpenSection((p) =>
                          p === "Description" ? null : "Description",
                        )
                      }
                      className="w-full flex items-center justify-between py-4 text-left focus:outline-none group">
                      <div className="flex items-center gap-4">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#fcecf3] flex items-center justify-center text-[#da127d] transition-transform group-hover:scale-105 flex-shrink-0">
                          <DocumentTextIcon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <span className="text-[15px] font-medium text-gray-800">
                          Description
                        </span>
                      </div>
                      <div className="text-gray-400 group-hover:text-[#da127d] transition-colors">
                        {openSection === "Description" ? (
                          <MinusIcon className="w-4 h-4" />
                        ) : (
                          <PlusIcon className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {openSection === "Description" && (
                      <div className="pb-6 pl-[54px] pr-4 text-[14px] text-gray-700 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                        {product.description ? (
                          <div
                            className="product-description-html"
                            dangerouslySetInnerHTML={{
                              __html: product.description,
                            }}
                          />
                        ) : (
                          <p className="mb-5 whitespace-pre-wrap">
                            Detailed product description goes here. This
                            beautiful piece is crafted with care and designed to
                            make you stand out.
                          </p>
                        )}
                        {/* NOTE: removed the `product.specifications` block that was here —
                            that field doesn't exist anywhere in the admin form or normalize()
                            output, so it could never render. Highlights above already cover
                            the "spec list" use case (title/value pairs). */}
                      </div>
                    )}
                  </div>

                  {/* Fabric & Wash Care Accordion */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() =>
                        setOpenSection((p) =>
                          p === "Fabric" ? null : "Fabric",
                        )
                      }
                      className="w-full flex items-center justify-between py-4 text-left focus:outline-none group">
                      <div className="flex items-center gap-4">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#fcecf3] flex items-center justify-center text-[#da127d] transition-transform group-hover:scale-105 flex-shrink-0">
                          <ShirtIcon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <span className="text-[15px] font-medium text-gray-800">
                          Fabric & Wash Care
                        </span>
                      </div>
                      <div className="text-gray-400 group-hover:text-[#da127d] transition-colors">
                        {openSection === "Fabric" ? (
                          <MinusIcon className="w-4 h-4" />
                        ) : (
                          <PlusIcon className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {openSection === "Fabric" && (
                      <div className="pb-6 pl-[54px] pr-4 text-[14px] text-gray-700 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                        <ul className="list-disc pl-4 space-y-1.5 marker:text-gray-400">
                          <li>Handloom-cotton (100% Cotton)</li>
                          <li>Hand wash in cold water</li>
                          <li>Use mild detergent</li>
                          <li>Wash light colors together</li>
                          <li>
                            Dark colors may bleed; wash separately for the first
                            few washes
                          </li>
                          <li>
                            Hand-dyed (tie-dye) products might bleed during the
                            first few washes. Kindly wash them separately
                          </li>
                          <li>Do not soak or wring</li>
                          <li>
                            Dry in shade; avoid direct sunlight to prevent
                            fading
                          </li>
                          <li>Avoid ironing on embroidery</li>
                          <li>Iron on low heat if needed</li>
                          <li>No machine wash or dry clean</li>
                          <li>
                            Avoid strong detergents or fabric softeners to
                            preserve fabric quality
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Return & Exchange Accordion */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() =>
                        setOpenSection((p) =>
                          p === "Return" ? null : "Return",
                        )
                      }
                      className="w-full flex items-center justify-between py-4 text-left focus:outline-none group">
                      <div className="flex items-center gap-4">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#fcecf3] flex items-center justify-center text-[#da127d] transition-transform group-hover:scale-105 flex-shrink-0">
                          <ExchangeIcon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <span className="text-[15px] font-medium text-gray-800">
                          Return & Exchange
                        </span>
                      </div>
                      <div className="text-gray-400 group-hover:text-[#da127d] transition-colors">
                        {openSection === "Return" ? (
                          <MinusIcon className="w-4 h-4" />
                        ) : (
                          <PlusIcon className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {openSection === "Return" && (
                      <div className="pb-6 pl-[54px] pr-4 text-[13px] text-gray-700 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                        <p className="font-semibold mb-3">
                          NOTE FOR RETURN & EXCHANGE :
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 marker:text-gray-400 mb-6">
                          <li>
                            All 'Black Friday Sale', 'Birthday Sale' or 'Buy 2
                            Get 1 free' purchases are final and not eligible for
                            return or exchange.
                          </li>
                          <li>
                            The items should be unused and unwashed for hygiene
                            reasons.
                          </li>
                          <li>
                            We do not offer cashback. Refunds are only made in
                            terms of a Store Credit.
                          </li>
                          <li>
                            Items purchased for FREE during an offer, will not
                            be accepted for returns.
                          </li>
                          <li>
                            The product should have the original packaging and
                            tags in place. Items without the original tags will
                            not be accepted.
                          </li>
                          <li>
                            Return/Exchange requests that are not raised within
                            7 DAYS of receiving the product would not be
                            accepted.
                          </li>
                          <li>
                            The product would be picked in 3-5 days after the
                            return or exchange request is approved.
                          </li>
                          <li>
                            Return charges would have to be borne by the
                            customer.( Rs150/-)
                          </li>
                          <li>
                            There are no charges for exchange. Exchanges are for
                            size & design both, subject to availability.
                          </li>
                          <li>
                            'On Sale' Products are not eligible for
                            Return/Exchange.
                          </li>
                          <li>
                            The credit note issued, will be valid for 1 year
                            from the date of issuance.
                          </li>
                          <li>
                            Misprints and colour differences from website images
                            are not considered damaged products. We only sell
                            handcrafted products and these are all signs of
                            authenticity.
                          </li>
                          <li>
                            Each order is eligible for a return/exchange only
                            once.
                          </li>
                          <li>
                            The company holds the authority to make the final
                            decision in any case.
                          </li>
                          <li>
                            Please note, products from our brand bought from
                            other stores or marketplaces like Myntra are not
                            eligible for any return or exchange at our store or
                            on the website.
                          </li>
                        </ul>
                        <p className="mb-6 uppercase">
                          <strong>REFUNDS WILL TAKE 7-10 WORKING DAYS.</strong>{" "}
                          Please Note: We only do money refunds in case of Wrong
                          or Damaged products being delivered. In any other
                          case, a refund is made only is terms of STORE CREDIT.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Accordion */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() =>
                        setOpenSection((p) =>
                          p === "Shipping" ? null : "Shipping",
                        )
                      }
                      className="w-full flex items-center justify-between py-4 text-left focus:outline-none group">
                      <div className="flex items-center gap-4">
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#fcecf3] flex items-center justify-center text-[#da127d] transition-transform group-hover:scale-105 flex-shrink-0">
                          <TruckIcon className="w-5 h-5 stroke-[1.5]" />
                        </div>
                        <span className="text-[15px] font-medium text-gray-800">
                          Shipping
                        </span>
                      </div>
                      <div className="text-gray-400 group-hover:text-[#da127d] transition-colors">
                        {openSection === "Shipping" ? (
                          <MinusIcon className="w-4 h-4" />
                        ) : (
                          <PlusIcon className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {openSection === "Shipping" && (
                      <div className="pb-6 pl-[54px] pr-4 text-[13px] text-gray-700 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                        <ul className="list-disc pl-4 space-y-1.5 marker:text-gray-400">
                          <li>
                            Babli offers{" "}
                            <strong>FREE PAN India shipping</strong> on all
                            orders above 1000/-.
                          </li>
                          <li>
                            For all orders below 1000/-, it's just a nominal
                            charge of Rs.150/-.
                          </li>
                          <li>
                            For COD orders, we charge Rs.50/- for COD charges.
                          </li>
                          <li>
                            Your orders are our priority! We dispatch them
                            within 3-4 working days and you can expect the
                            delivery within 7-10 days.
                          </li>
                          <li>
                            You'll receive tracking details on registered mail
                            id and whatsapp to keep tabs on your parcel once
                            it's on its way.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* end right panel */}
        </div>

        {/* ── Customer Reviews ── */}
        <div className="border-t border-gray-200 mt-12 pt-12 bg-white">
          <CustomerReviews product={product} />
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>

      {/* ── Sticky Bottom Bar (mobile) ── */}
      <ProductBottomBar
        product={product}
        handleAddToCart={handleAddToCart}
        isAdding={isAdding}
      />

      {/* ── Login Modal ── */}
      {showLoginModal && <LoginPoup setShowLoginModal={setShowLoginModal} />}
    </div>
  );
};

export default ProductDetailsPage;
