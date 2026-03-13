import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  RefreshCw,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Minus,
  Plus,
} from "lucide-react";

import { useProducts } from "../features/product/hook/useProducts";
import { useWishlist } from "../features/wishList/context/WishlistContext";
import { useCart } from "../features/cart/context/CartContext";
import { useAuth } from "../features/auth/context/UserContext";

import ProductImageGallery from "../components/product/ProductImageGallery";
import RelatedProducts from "../components/product/RelatedProducts";
import ProductBottomBar from "../features/account/components/bars/ProductBottomBar";
import LoginPoup from "../components/pop-up/LoginPoup";
import NotificationProduct from "../components/cards/NotificationProduct";
import AccordionRow from "../features/product/copmonents/AccordionRow";

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (n) => `₹ ${new Intl.NumberFormat("en-IN").format(n)}`;

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
  </div>
);

// ─── 404 Error State ──────────────────────────────────────────────────────────
const ErrorState = ({ navigate }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 gap-4">
    <div className="text-8xl font-bold text-gray-100 select-none">404</div>
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
      Product Not Found
    </h2>
    <p className="text-gray-500 max-w-sm mb-4">
      This item isn't available right now. Explore our latest collection.
    </p>
    <button
      onClick={() => navigate("/")}
      className="px-8 py-3 bg-[#e11b22] text-white font-bold tracking-wide hover:bg-red-700 transition-colors">
      BACK TO HOME
    </button>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // ✅ FIX 1: Correct destructuring — hook exports `loadingAll` and `errors`, not `loading`/`error`
  const { getProductBySlug, errors } = useProducts();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  // ✅ FIX 2: Local state for fetching & product — avoids relying on hook's global loading flag
  const [product, setProduct] = useState(null);
  const [fetching, setFetching] = useState(true); // true until first fetch resolves
  const [fetchError, setFetchError] = useState(false);

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");

  // ✅ FIX 3: product?.id is safe now because wishlist hook receives undefined until product loads
  const { isWishlisted, add: addToWishlist } = useWishlist(product?.id);

  // ✅ FIX 4: Removed `getProductBySlug` from deps — it's a new ref every render and causes infinite loop
  useEffect(() => {
    let cancelled = false; // prevent state update if component unmounts mid-fetch

    const fetchProduct = async () => {
      setFetching(true);
      setFetchError(false);

      try {
        const data = await getProductBySlug(slug);
        if (cancelled) return;

        if (data) {
          setProduct(data);
          if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        } else {
          setFetchError(true); // slug found nothing → show 404
        }
      } catch (e) {
        console.error("ProductDetailsPage fetch error:", e);
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "instant" });

    return () => {
      cancelled = true;
    }; // cleanup on slug change
  }, [slug]); // ✅ only re-run when slug changes

  const notify = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleWishlist = () => {
    if (!product) return;
    if (!isLoggedIn) return setShowLoginModal(true);
    addToWishlist();
    notify(
      "info",
      isWishlisted ? "Removed from wishlist" : "Saved to wishlist",
    );
  };

  const handleAddToCart = async (redirect = false) => {
    if (!isLoggedIn) return setShowLoginModal(true);
    if (product.sizes?.length > 0 && !selectedSize) {
      return notify("error", "Please select a size");
    }

    setIsAdding(true);
    try {
      await addToCart({
        id: product.id,
        selectedSize,
        selectedQuantity: quantity,
      });
      if (redirect) navigate("/checkout/cart");
      else notify("success", "Added to cart!");
    } catch {
      notify("error", "Something went wrong. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const checkPincode = () => {
    if (pincode.length === 6) {
      setPincodeMsg("✓ Eligible for delivery and 30-day return.");
    } else {
      setPincodeMsg("Please enter a valid 6-digit pincode.");
    }
  };

  // ✅ FIX 5: Correct guard order — fetching first, then error, then missing product
  if (fetching) return <LoadingSkeleton />;
  if (fetchError || !product) return <ErrorState navigate={navigate} />;

  const allImages = [product.banner, ...(product.images || [])].filter(Boolean);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen md:mt-30 bg-white font-sans text-gray-900 selection:bg-gray-200">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 tracking-wide uppercase">
          <span
            className="hover:text-gray-800 cursor-pointer transition-colors"
            onClick={() => navigate("/")}>
            Home
          </span>
          <span>/</span>
          <span className="hover:text-gray-800 cursor-pointer transition-colors">
            {product.categoryId || "Oversized Shirts"}
          </span>
          <span>/</span>
          <span className="hover:text-gray-800 cursor-pointer transition-colors">
            {product.brand || "The Souled Store"}
          </span>
          <span>/</span>
          <span className="text-gray-800 truncate">{product.name}</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-4">
              <ProductImageGallery
                images={allImages}
                activeIndex={activeImageIndex}
                onImageChange={setActiveImageIndex}
                productName={product.name}
              />
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 flex flex-col pt-2 max-w-lg">
            {/* Title & Category */}
            <div className="mb-5">
              <h1 className="text-[26px] font-bold text-gray-900 leading-tight mb-1">
                {product.name}
              </h1>
              <p className="text-[13px] text-gray-500 font-medium">
                {product.categoryId || "Oversized Shirts"}
              </p>
            </div>

            <hr className="border-gray-100 mb-5" />

            {/* Price */}
            <div className="mb-6">
              <span className="text-[22px] font-bold text-gray-900 tracking-tight">
                {fmt(product.price)}
              </span>
              <p className="text-[11px] text-gray-400 font-medium mt-1">
                Price incl. of all taxes
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] font-bold text-gray-800">
                    Please select a size.
                  </span>
                  <button className="text-[11px] font-bold text-teal-600 hover:text-teal-700 underline underline-offset-2">
                    SIZE CHART
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[42px] h-[40px] flex items-center justify-center text-[13px] font-semibold border transition-all ${
                        selectedSize === s
                          ? "border-red-600 text-red-600 bg-red-50"
                          : "border-gray-300 bg-white text-gray-600 hover:border-gray-500"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[13px] font-bold text-gray-800">
                Quantity
              </span>
              <div className="inline-flex items-center border border-gray-300 h-9 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30">
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-[13px] font-semibold text-gray-900">
                  {quantity < 10 ? `0${quantity}` : quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={isAdding || isOutOfStock}
                className="flex-[1.2] h-12 bg-[#e11b22] hover:bg-red-700 text-white text-[13px] font-bold uppercase tracking-wide flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm">
                {isOutOfStock
                  ? "OUT OF STOCK"
                  : isAdding
                    ? "ADDING..."
                    : "ADD TO CART"}
              </button>
              <button
                onClick={handleWishlist}
                className={`flex-[1] h-12 border flex items-center justify-center gap-2 text-[12px] font-bold tracking-wide transition-colors rounded-sm ${
                  isWishlisted
                    ? "border-red-600 text-red-600 bg-red-50"
                    : "border-teal-500 text-teal-600 hover:bg-teal-50"
                }`}>
                <Heart
                  size={16}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
                ADD TO WISHLIST
              </button>
            </div>

            {/* Share Links */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[13px] text-gray-500 font-medium">
                Share
              </span>
              <div className="flex items-center gap-3 text-gray-500">
                <button className="hover:text-green-600 transition-colors">
                  <MessageCircle size={16} />
                </button>
                <button className="hover:text-blue-600 transition-colors">
                  <Facebook size={16} />
                </button>
                <button className="hover:text-blue-400 transition-colors">
                  <Twitter size={16} />
                </button>
                <button className="hover:text-pink-600 transition-colors">
                  <Instagram size={16} />
                </button>
              </div>
            </div>

            {/* Delivery / Pincode */}
            <div className="mb-8">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3">
                Delivery Details
              </h3>
              <div className="flex border border-gray-300 h-11 bg-white rounded-sm overflow-hidden focus-within:border-gray-500 transition-colors">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    setPincodeMsg("");
                  }}
                  className="flex-1 px-4 text-[13px] outline-none w-full"
                />
                <button
                  onClick={checkPincode}
                  className="px-6 text-teal-600 font-bold text-[12px] tracking-wide hover:text-teal-800 transition-colors">
                  CHECK
                </button>
              </div>
              {pincodeMsg && (
                <p
                  className={`text-[11px] mt-2 font-medium ${
                    pincodeMsg.includes("✓") ? "text-green-600" : "text-red-500"
                  }`}>
                  {pincodeMsg}
                </p>
              )}
              <div className="flex items-start gap-3 mt-4 border border-gray-200 p-4 bg-[#fcfcfc] rounded-sm">
                <RefreshCw
                  size={18}
                  strokeWidth={1.5}
                  className="text-gray-500 shrink-0 mt-0.5"
                />
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  This product is eligible for return or exchange under our
                  30-day return or exchange policy. No questions asked.
                </p>
              </div>
            </div>

            {/* Accordion */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <AccordionRow label="Product Details" defaultOpen={true}>
                <div className="px-4 pb-4 bg-white flex flex-col gap-5 text-[13px] text-gray-600">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Material & Care:
                    </h4>
                    <p>{product.material || "100% Cotton"}</p>
                    <p>Machine Wash</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Country of Origin:
                    </h4>
                    <p>India (and proud)</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Manufactured & Sold By:
                    </h4>
                    <p className="leading-relaxed">
                      {product.brand || "The Souled Store Pvt. Ltd."}
                      <br />
                      224, Tantia Jogani Industrial Premises
                      <br />
                      J.R. Boricha Marg, Lower Parel (E)
                      <br />
                      Mumbai - 400 011
                    </p>
                  </div>
                </div>
              </AccordionRow>
            </div>
          </div>
        </div>
      </main>

      {/* Overlays */}
      {notification && (
        <NotificationProduct
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      <ProductBottomBar
        product={product}
        handleAddToCart={() => handleAddToCart(false)}
        isAdding={isAdding}
      />

      {showLoginModal && <LoginPoup setShowLoginModal={setShowLoginModal} />}
    </div>
  );
};

export default ProductDetailsPage;
