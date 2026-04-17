import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

// ─── Accordion Row ────────────────────────────────────────────────────────────
const AccordionRow = ({ label, icon: Icon, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-200 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 px-0 text-left focus:outline-none group">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#fce7f3] flex items-center justify-center text-[#db2777] flex-shrink-0 transition-transform group-hover:scale-105">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[15px] font-medium text-gray-800">{label}</span>
      </div>
      <div className="text-gray-400 ml-4">
        {isOpen ? (
          <MinusIcon className="w-4 h-4" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
      </div>
    </button>
    {isOpen && (
      <div className="pb-6 pl-0 sm:pl-14 pr-2 text-[14px] text-gray-600 leading-relaxed">
        {children}
      </div>
    )}
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
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");
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
    setPincode("");
    setPincodeMsg("");
    setOpenSection("Description");

    const fetchProduct = async () => {
      try {
        const data = await getProductBySlug(slug);
        if (cancelled) return;
        if (data) {
          setProduct(data);
          if (data.sizes?.length) setSelectedSize(data.sizes[0]);
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

  const handleAddToCart = useCallback(
    async (redirect = false) => {
      if (!isLoggedIn) return setShowLoginModal(true);
      if (product.sizes?.length > 0 && !selectedSize)
        return notify("error", "Please select a size");

      setIsAdding(true);
      try {
        await addToCart({
          id: product.id,
          selectedSize,
          selectedQuantity: quantity,
        });
        if (redirect) {
          navigate("/checkout/cart");
        } else {
          notify("success", "Added to bag!");
        }
      } catch {
        notify("error", "Something went wrong. Please try again.");
      } finally {
        setIsAdding(false);
      }
    },
    [isLoggedIn, product, selectedSize, quantity, addToCart, navigate, notify],
  );

  const checkPincode = () => {
    const pin = pincode.trim();
    if (/^\d{6}$/.test(pin)) {
      setPincodeMsg("✓ Delivery available — estimated 3–5 business days.");
    } else {
      setPincodeMsg("Please enter a valid 6-digit pincode.");
    }
  };

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
  const allImages = [product.banner, ...(product.images || [])].filter(Boolean);
  const isOutOfStock = product.stock === 0;
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const variantKey = `${product.id}_${selectedSize}`;
  const cartItems = cart?.cart || [];
  const alreadyInCart = cartItems.some((item) => item.cartKey === variantKey);

  const maxQty = Math.min(product.stock || 10, 10);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-24 md:pb-0 md:mt-5">
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
              label: product.categoryId || "Clothing",
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
                  {product.category || "Tops"}
                </span>
              </div>

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
                <span className="text-[14px] text-gray-600">13 reviews</span>
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

              {/* ── 5. Available Offers (Matches Design) ── */}
              <div className="mb-8">
                <h3 className="text-[15px] text-gray-700 mb-3">
                  Available Offers
                </h3>
                <div className="bg-[#f8f8f8] px-4 py-3.5 rounded flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {/* Custom SVG for the Black Starburst Badge */}
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
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">
                        Buy 3 Get 15% off
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5">
                        Use Code: BUY3GET15
                      </p>
                    </div>
                  </div>
                  <span className="text-[14px] text-gray-500 font-medium hidden sm:block">
                    3 / 3
                  </span>
                </div>
              </div>

              {/* ── 6. Color Variants ── */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <span className="text-[14px] text-gray-800 mb-3 block">
                    Color Family
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <a
                        key={color.id}
                        href={`/product/${color.slug}`}
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
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 7. Size Selector (Square Design) ── */}
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

              {/* ── 8. Pincode Delivery Box (Matches Design) ── */}
              <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden max-w-[400px]">
                <div className="bg-black text-white text-[13px] font-medium text-center py-2.5">
                  Enter Pincode to Check The Delivery Date
                </div>
                <div className="p-4 bg-white">
                  <p className="text-[14px] text-gray-800 mb-2">
                    Estimated Delivery
                  </p>

                  {/* Input area with thick black underline */}
                  <div className="flex items-center justify-between border-b-[1.5px] border-black pb-1.5 mb-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setPincode(val);
                        if (pincodeMsg) setPincodeMsg("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && checkPincode()}
                      className="flex-1 text-[14px] bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
                      placeholder="250002"
                      maxLength={6}
                    />
                    <button
                      onClick={checkPincode}
                      disabled={pincode.length === 0}
                      className="text-[13px] font-bold text-black uppercase tracking-wide hover:text-[#e6007e] transition-colors disabled:opacity-40 px-1">
                      Check
                    </button>
                  </div>

                  {pincodeMsg && (
                    <p
                      className={`text-[12px] font-medium ${pincodeMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
                      {pincodeMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* ── 9. CTA Buttons ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isAdding || isOutOfStock || alreadyInCart}
                  className={`flex-1 py-3.5 rounded-[4px] font-bold uppercase tracking-widest text-[13px] transition-all duration-200 ${
                    alreadyInCart
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : isOutOfStock
                        ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                  }`}>
                  {isOutOfStock
                    ? "Out of Stock"
                    : alreadyInCart
                      ? "In Bag"
                      : isAdding
                        ? "Adding…"
                        : "Add to Bag"}
                </button>

                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-3.5 border rounded-[4px] flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-widest transition-all duration-200 ${
                    wishlisted
                      ? "border-[#e6007e] text-[#e6007e] bg-pink-50"
                      : "border-gray-300 text-gray-900 hover:border-[#e6007e] hover:text-[#e6007e]"
                  }`}>
                  {wishlisted ? (
                    <HeartSolid className="w-4 h-4" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                  {wishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>

              {/* ── 10. PRODUCT INFORMATION ACCORDIONS (Matches Pink Design) ── */}
              <div className="mt-10">
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
                        <p className="mb-5">
                          {product.details?.description ||
                            "Detailed product description goes here. This beautiful piece is crafted with care and designed to make you stand out."}
                        </p>
                        {product.details?.specifications && (
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3 text-[14px]">
                              Specifications
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                              {Object.entries(
                                product.details.specifications,
                              ).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <span className="text-gray-400 text-[12px] uppercase tracking-wider mb-0.5">
                                    {key}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                          {product.details?.materialCare ? (
                            product.details.materialCare
                              .split("\n")
                              .filter(Boolean)
                              .map((line, idx) => <li key={idx}>{line}</li>)
                          ) : (
                            <>
                              <li>Machine wash cold with like colors.</li>
                              <li>Do not bleach or tumble dry.</li>
                              <li>Warm iron if needed.</li>
                            </>
                          )}
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
                      <div className="pb-6 pl-[54px] pr-4 text-[14px] text-gray-700 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                        {product.details?.returnPolicy ? (
                          <p>{product.details.returnPolicy}</p>
                        ) : (
                          <ul className="list-disc pl-4 space-y-2 marker:text-gray-400">
                            <li>
                              Return/exchange must be raised within 7 days of
                              delivery.
                            </li>
                            <li>Original packaging and tags must be intact.</li>
                            <li>
                              Exchanges are free and available for both size and
                              design.
                            </li>
                            <li>
                              <strong>Refunds take 7–10 working days.</strong>
                            </li>
                          </ul>
                        )}
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
                      <div className="pb-6 pl-[54px] pr-4 text-[14px] text-gray-700 leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                        {product.details?.shippingPolicy ? (
                          <p>{product.details.shippingPolicy}</p>
                        ) : (
                          <ul className="list-disc pl-4 space-y-2 marker:text-gray-400">
                            <li>Orders dispatched within 24–48 hours.</li>
                            <li>Delivery in 3–7 business days.</li>
                            <li>
                              Tracking link sent via email and SMS once shipped.
                            </li>
                          </ul>
                        )}
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
        <CustomerReviews />

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </main>

      {/* ── Sticky Bottom Bar (mobile) ── */}
      <ProductBottomBar
        product={product}
        handleAddToCart={() => handleAddToCart(false)}
        isAdding={isAdding}
      />

      {/* ── Login Modal ── */}
      {showLoginModal && <LoginPoup setShowLoginModal={setShowLoginModal} />}
    </div>
  );
};

export default ProductDetailsPage;
