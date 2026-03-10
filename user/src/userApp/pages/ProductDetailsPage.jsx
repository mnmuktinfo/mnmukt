import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Share2,
  Ruler,
  ChevronRight,
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
} from "lucide-react";

// Hooks & Context
import { useProducts } from "../features/product/hook/useProducts";
import { useWishlist } from "../features/wishList/context/WishlistContext";
import { useCart } from "../features/cart/context/CartContext";
import { useAuth } from "../features/auth/context/UserContext";

// Components
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductAccordion from "../components/product/ProductAccordion";
import RelatedProducts from "../components/product/RelatedProducts";
import ProductBottomBar from "../features/account/components/bars/ProductBottomBar";
import LoginPoup from "../components/pop-up/LoginPoup";
import NotificationProduct from "../components/cards/NotificationProduct";

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { getProductBySlug, loading, error } = useProducts();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { isWishlisted, add: addToWishlist } = useWishlist(product?.id);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductBySlug(slug);
        if (data) {
          setProduct(data);
          if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
          if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        console.error("Data retrieval failed:", err);
      }
    };
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug, getProductBySlug]);

  const discountPercentage = useMemo(() => {
    if (!product?.originalPrice || !product?.price) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100,
    );
  }, [product]);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleWishlistToggle = () => {
    if (!product) return;
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    addToWishlist();
    showNotification(
      "info",
      isWishlisted ? "Registry updated: Removed" : "Registry updated: Added",
    );
  };

  const handleAddToCart = async (redirect = false) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      showNotification("error", "Protocol: Size selection required");
      return;
    }
    setIsAdding(true);
    try {
      await addToCart({
        id: product.id,
        selectedSize,
        selectedQuantity: quantity,
      });
      if (redirect) navigate("/checkout/cart");
      else showNotification("success", "Item added to your selection");
    } catch (err) {
      showNotification("error", "System synchronization failed");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error || !product) return <ErrorState navigate={navigate} />;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-pink-50 relative overflow-x-hidden">
      {/* 1. MYNTRA-STYLE ELITE NAV - Fully Responsive HUD */}
      <nav className="sticky top-0 z-60 bg-white/80 backdrop-blur-xl border-b border-slate-50 transition-all duration-500">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Left Side: Navigation Protocol */}
          <div className="flex items-center gap-4 md:gap-10">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-950 transition-all">
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="hidden sm:inline">Return</span>
            </button>

            <div className="hidden lg:flex items-center gap-3 border-l border-slate-100 pl-8 h-5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
                Archive /{" "}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900">
                {product.category || "Selected Item"}
              </span>
            </div>
          </div>

          {/* Center Identity HUD */}
          <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-950 truncate max-w-[120px] md:max-w-none">
              {product.name}
            </span>
            <div className="flex gap-1 mt-1">
              <div className="w-4 h-1px bg-[#ff356c]" />
              <div className="w-1 h-1px bg-slate-200" />
            </div>
          </div>

          {/* Right Side: Utility Icons */}
          <div className="flex items-center gap-2 md:gap-6">
            <button className="hidden sm:block p-2 text-slate-300 hover:text-slate-950 transition-colors">
              <Share2 size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-2 transition-all ${isWishlisted ? "text-[#ff356c]" : "text-slate-300 hover:text-slate-950"}`}>
              <Heart
                size={20}
                fill={isWishlisted ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-24 items-start">
          {/* LEFT: THE CINEMATIC GALLERY (Desktop Sticky / Mobile Stack) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-32">
            <ProductImageGallery
              images={product.images}
              activeIndex={activeImageIndex}
              onImageChange={setActiveImageIndex}
              productName={product.name}
            />
          </div>

          {/* RIGHT: THE DATA MANIFEST */}
          <div className="lg:col-span-5 space-y-10 md:space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 lg:pb-0">
            <ProductInfo
              product={product}
              discount={discountPercentage}
              formatPrice={(p) => `₹${p.toLocaleString()}`}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              quantity={quantity}
              setQuantity={setQuantity}
              handleAddToCart={() => handleAddToCart(false)}
              handleWishlistToggle={handleWishlistToggle}
              isWishlisted={isWishlisted}
              isAdding={isAdding}
            />

            {/* SERVICE BENTO GRID */}
            <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-50">
              <div className="flex flex-col gap-3 p-5 bg-slate-50/50 rounded-sm">
                <ShieldCheck
                  size={20}
                  className="text-[#ff356c]"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">
                  Security Verified
                </span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  Verified Authentic Craft
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-slate-50/50 rounded-sm group cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                <Ruler
                  size={20}
                  className="text-slate-400 group-hover:text-black transition-colors"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">
                  Dimension Guide
                </span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  View Size Blueprint
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-slate-50/50 rounded-sm">
                <Truck size={20} className="text-slate-400" strokeWidth={1.5} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">
                  Express Delivery
                </span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  3-5 Day Dispatch
                </p>
              </div>
              <div className="flex flex-col gap-3 p-5 bg-slate-50/50 rounded-sm">
                <RefreshCw
                  size={20}
                  className="text-slate-400"
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">
                  Return Policy
                </span>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  7 Cycle Exchange
                </p>
              </div>
            </div>

            <div className="pt-2">
              <ProductAccordion product={product} />
            </div>
          </div>
        </div>

        {/* RELATED SELECTIONS */}
        <section className="mt-32 md:mt-52 border-t border-slate-50 pt-24 md:pt-32">
          <div className="flex flex-col items-center mb-16 text-center space-y-4 md:space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#ff356c]">
              Complementary Registry
            </p>
            <h3 className="text-4xl md:text-7xl font-bold tracking-tighter text-slate-950 leading-none">
              Complete the <span className="italic font-serif">Manifesto.</span>
            </h3>
          </div>
          <RelatedProducts
            currentProductId={product.id}
            categoryId={product.categoryId}
          />
        </section>
      </main>

      {notification && (
        <NotificationProduct
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* MOBILE OPTIMIZED PERSISTENT BOTTOM BAR */}
      <ProductBottomBar
        product={product}
        handleAddToCart={() => handleAddToCart(false)}
        isAdding={isAdding}
      />

      {showLoginModal && <LoginPoup setShowLoginModal={setShowLoginModal} />}
    </div>
  );
};

// --- ARCHITECTURAL STATES ---

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 space-y-6">
    <div className="w-1px h-32 bg-slate-100 animate-pulse" />
    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-300 animate-pulse">
      Initializing Collection
    </span>
  </div>
);

const ErrorState = ({ navigate }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center bg-white">
    <h2 className="text-6xl md:text-9xl font-bold tracking-tighter italic font-serif mb-8 text-[#ff356c]">
      Void.
    </h2>
    <p className="text-[11px] uppercase tracking-[0.5em] font-black text-slate-400 mb-12 max-w-sm leading-loose">
      Acquisition target not found in main server registry
    </p>
    <button
      onClick={() => navigate("/")}
      className="px-16 py-6 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.6em] hover:bg-[#ff356c] transition-all duration-700 shadow-2xl">
      Return to Index
    </button>
  </div>
);

export default ProductDetailsPage;
