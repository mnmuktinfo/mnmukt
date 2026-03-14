import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Tag,
  RefreshCw,
} from "lucide-react";

import { useProducts } from "../features/product/hook/useProducts";
import { useWishlist } from "../features/wishList/context/WishlistContext";
import { useCart } from "../features/cart/context/CartContext";
import { useAuth } from "../features/auth/context/UserContext";

import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductBottomBar from "../features/account/components/bars/ProductBottomBar";
import LoginPoup from "../components/pop-up/LoginPoup";
import NotificationProduct from "../components/cards/NotificationProduct";
import AccordionRow from "../features/product/copmonents/AccordionRow";

// ─── Utilities ────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-10 h-10 border-4 border-gray-100 border-t-[#da127d] rounded-full animate-spin" />
  </div>
);

// ─── 404 State ────────────────────────────────────────────────────────────────
const ErrorState = ({ navigate }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-4 bg-white">
    <div className="text-8xl font-black text-gray-50 select-none">404</div>
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
      Product Not Found
    </h2>
    <p className="text-gray-500 max-w-sm mb-4">
      We couldn't find what you're looking for. Let's get you back on track.
    </p>
    <button
      onClick={() => navigate("/")}
      className="px-8 py-3.5 bg-[#da127d] text-white font-bold tracking-widest text-sm hover:bg-[#c20d6c] transition-colors rounded-sm">
      BACK TO HOME
    </button>
  </div>
);

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { getProductBySlug, getProductsByCategory } = useProducts();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, cart } = useCart();

  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
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

  const { isWishlisted, toggleWishlist } = useWishlist();

  const wishlisted = product ? isWishlisted(product.id) : false;
  // ─── Fetch Product ───────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

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
          setFetchError(true);
        }
      } catch (err) {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "instant" });

    return () => (cancelled = true);
  }, [slug, getProductBySlug]);

  // ── Fetch related products ──
  useEffect(() => {
    if (!product?.categoryId) return;

    let cancelled = false;

    const fetchRelated = async () => {
      try {
        const data = await getProductsByCategory(product.categoryId);
        if (!cancelled && data) {
          // exclude current product
          setRelatedProducts(data.filter((p) => p.id !== product.id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRelated();
    return () => (cancelled = true);
  }, [product, getProductsByCategory]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const notify = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleWishlist = () => {
    if (!product) return;
    if (!isLoggedIn) return setShowLoginModal(true);

    toggleWishlist(product.id);

    const nowWishlisted = isWishlisted(product.id); // check current state after toggle
    notify(
      nowWishlisted ? "success" : "info",
      nowWishlisted ? "Saved to wishlist" : "Removed from wishlist",
    );
  };

  const handleAddToCart = async (redirect = false) => {
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
      if (redirect) navigate("/checkout/cart");
      else notify("success", "Added to bag!");
    } catch {
      notify("error", "Something went wrong. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const checkPincode = () => {
    if (pincode.length === 6) {
      setPincodeMsg("✓ Delivery available. Expect 3-5 days delivery.");
    } else {
      setPincodeMsg("Please enter a valid 6-digit pincode.");
    }
  };

  // ─── Rendering Guards ─────────────────────────────────────────────────────
  if (fetching) return <LoadingSkeleton />;
  if (fetchError || !product) return <ErrorState navigate={navigate} />;

  // ─── Data Prep ────────────────────────────────────────────────────────────
  const allImages = [product.banner, ...(product.images || [])].filter(Boolean);
  const isOutOfStock = product.stock === 0;

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price);
  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const variantKey = product ? `${product.id}_${selectedSize}` : null;
  const cartItems = cart?.cart || []; // default to empty array if undefined
  const alreadyInCart =
    product && variantKey
      ? cartItems.some((item) => item.cartKey === variantKey)
      : false;
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20 md:pb-0  md:mt-5">
      {/* ── Breadcrumbs ── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 capitalize tracking-wide">
          <span
            className="hover:text-gray-900 cursor-pointer transition-colors"
            onClick={() => navigate("/")}>
            Home
          </span>
          <span>/</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">
            {product.categoryId || "Clothing"}
          </span>
          <span>/</span>
          <span className="hover:text-gray-900 cursor-pointer transition-colors">
            {product.brand || "Brand"}
          </span>
          <span>/</span>
          <span className="text-gray-900 truncate font-semibold">
            {product.name}
          </span>
        </div>
      </div>

      <main className=" mx-auto px-4 md:px-8 pb-16 mt-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          {/* ── LEFT: Image Gallery ── */}
          <div className="w-full lg:w-[58%]">
            {/* Kept your gallery component, assuming it handles the grid/slider internally */}
            <ProductImageGallery
              images={allImages}
              activeIndex={activeImageIndex}
              onImageChange={setActiveImageIndex}
              productName={product.name}
            />
          </div>

          {/* ── RIGHT: Product Details (Sticky on Desktop) ── */}
          <div className="w-full lg:w-[42%] flex flex-col">
            <div className="lg:sticky lg:top-32 pb-10">
              {/* Brand & Name */}
              {/* Product Header with Variants */}
              <div className="mb-4 px-2 sm:px-0">
                {/* Brand & Name */}
                <div className="mb-2">
                  <h1 className="text-lg sm:text-xl md:text-[20px] text-gray-900 font-semibold tracking-tight truncate">
                    {product.brand || "Mnmukt"}
                  </h1>
                  <h2 className="text-sm sm:text-[14px] md:text-[16px] text-gray-500 font-normal leading-tight truncate">
                    {product.name}
                  </h2>
                </div>

                {/* Pricing Section */}
                <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap mb-2">
                  <span className="text-xl sm:text-2xl md:text-[24px] font-bold text-gray-900">
                    {fmt(price)}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-sm sm:text-[14px] md:text-[16px] text-gray-500 line-through">
                        MRP {fmt(originalPrice)}
                      </span>
                      <span className="text-sm sm:text-[14px] md:text-[16px] font-bold text-pink-500">
                        ({discount}% OFF)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-[12px] md:text-[14px] font-medium text-green-700">
                  Inclusive of all taxes
                </p>

                {/* Variants / Colors */}
                {product.colors?.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {product.colors.map((color) => (
                      <a
                        key={color.id}
                        href={`/product/${color.slug}`}
                        className="flex flex-col items-center text-center text-xs sm:text-[12px] md:text-[13px] hover:text-pink-500 transition-colors">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden mb-1"
                          style={{ backgroundColor: color.hex || "#ccc" }}>
                          {color.image && (
                            <img
                              src={color.image}
                              alt={color.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="truncate max-w-[50px]">
                          {color.name}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="mb-6 px-2 sm:px-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm sm:text-[15px] font-bold text-gray-900 uppercase tracking-wide">
                      Select Size
                    </span>
                    <button className="text-xs sm:text-[13px] font-bold text-pink-500 hover:underline">
                      Size Chart
                    </button>
                  </div>

                  {/* Size Options */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-[14px] font-bold border transition-all duration-200 ${
                          selectedSize === s
                            ? "border-pink-500 text-pink-500 bg-pink-50 shadow-sm"
                            : "border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Quantity Selector */}
              <div className="mb-6 flex items-center gap-3 px-2 sm:px-0">
                <span className="text-sm sm:text-[15px] font-bold text-gray-900 uppercase tracking-wide">
                  Quantity
                </span>

                <div className="inline-flex items-center border border-gray-300 rounded-sm bg-white h-9 sm:h-10 w-24 sm:w-28">
                  {/* Decrement */}
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex-1 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30">
                    <Minus size={14} />
                  </button>

                  {/* Current Quantity */}
                  <span className="w-8 sm:w-10 text-center text-[14px] sm:text-[15px] font-bold text-gray-900">
                    {quantity}
                  </span>

                  {/* Increment */}
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="flex-1 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Action Buttons - desktop only */}
              <div className="hidden lg:flex gap-3 mb-6 px-2 sm:px-0">
                {/* Add to Bag */}
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isAdding || isOutOfStock || alreadyInCart}
                  className={`flex-1 py-3 rounded-md font-bold uppercase tracking-widest text-[14px] transition-colors duration-200 ${
                    alreadyInCart
                      ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                      : "bg-pink-600 text-white hover:bg-pink-700"
                  }`}>
                  {alreadyInCart
                    ? "In Bag"
                    : isAdding
                      ? "Adding..."
                      : "Add to Bag"}
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlist}
                  className={`flex-1 py-3 border rounded-md flex items-center justify-center gap-2 text-[14px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                    wishlisted
                      ? "border-pink-600 text-pink-600 bg-pink-50"
                      : "border-gray-300 text-gray-700 hover:border-pink-600 hover:text-pink-600"
                  }`}>
                  <Heart
                    size={16}
                    fill={wishlisted ? "currentColor" : "none"}
                    className="transition-colors duration-200"
                  />
                  {wishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>
              <hr className="border-gray-200 mb-6" />

              {/* Delivery Options */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-[16px] uppercase tracking-wide">
                  <Truck size={20} />
                  Delivery Options
                </div>
                <div className="flex border border-gray-300 rounded-sm h-12 overflow-hidden focus-within:border-gray-900 transition-colors w-full max-w-sm mb-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter pincode"
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ""));
                      setPincodeMsg("");
                    }}
                    className="flex-1 px-4 text-[15px] outline-none w-full"
                  />
                  <button
                    onClick={checkPincode}
                    className="px-6 text-[#ff3f6c] font-bold text-[14px] hover:text-[#c20d6c] transition-colors">
                    Check
                  </button>
                </div>
                {pincodeMsg && (
                  <p
                    className={`text-[13px] font-medium ${pincodeMsg.includes("✓") ? "text-green-700" : "text-red-600"}`}>
                    {pincodeMsg}
                  </p>
                )}
                <p className="text-[13px] text-gray-500 mt-2">
                  Please enter PIN code to check delivery time & Pay on Delivery
                  Availability
                </p>

                {/* Trust Badges */}
                <div className="flex flex-col gap-3 mt-6 text-[14px] text-gray-700 font-medium">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-gray-400" /> 100%
                    Original Products
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw size={20} className="text-gray-400" /> Pay on
                    delivery might be available
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag size={20} className="text-gray-400" /> Easy 14 days
                    returns and exchanges
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Accordion / Details */}
              <AccordionRow label="Product Details" defaultOpen={true}>
                <div className="pt-2 pb-6 flex flex-col gap-6 text-[14px] text-gray-700 leading-relaxed">
                  {/* Material & Care */}
                  {product.details?.materialCare && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1.5 text-[15px]">
                        Material & Care
                      </h4>
                      {product.details.materialCare
                        .split("\n")
                        .map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                    </div>
                  )}

                  {/* Specifications */}
                  {product.details?.specifications && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1.5 text-[15px]">
                        Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        {Object.entries(product.details.specifications).map(
                          ([key, value]) => (
                            <div key={key}>
                              <span className="block text-gray-400 text-[12px] uppercase tracking-wider mb-1">
                                {key}
                              </span>
                              <span className="font-medium text-gray-900">
                                {value}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionRow>
            </div>
            {relatedProducts.length > 0 && (
              <RelatedProducts products={relatedProducts} />
            )}
          </div>
        </div>
      </main>

      {/* ── Overlays & Modals ── */}
      {notification && (
        <NotificationProduct
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Assuming this is your mobile sticky footer */}
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
