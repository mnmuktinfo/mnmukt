import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts } from "../../product/hook/useProducts";
import { useWishlist } from "../../../features/wishList/context/WishlistContext";
import { useAuth } from "../../auth/context/UserContext";

import EmptyWishlist from "./EmptyWishlist";
import MoveToCartPopUp from "../components/pop-up/MoveToCartPopUp";
import { WishlistCard } from "../components/cards/WishlistCard";
import NotificationProduct from "../../../components/cards/NotificationProduct";
import { Link } from "react-router-dom";
import { LogIn, Share2 } from "lucide-react";

/* ───────────── Minimal Skeleton ───────────── */
const WishlistSkeleton = () => (
  <div className="w-full bg-[#fcfcfc] min-h-screen pt-28 pb-20">
    <div className="max-w-[1400px] mx-auto px-6">
      <div className="flex flex-col items-center mb-16 animate-pulse">
        <div className="h-3 w-28 bg-gray-200 mb-5 " />
        <div className="h-8 w-48 bg-gray-200 mb-3" />
        <div className="h-3 w-32 bg-gray-100" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-3/4 bg-gray-200 w-full" />
            <div className="h-3 bg-gray-200 w-2/3" />
            <div className="h-3 bg-gray-100 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ───────────── Page ───────────── */
const WishlistPage = () => {
  const queryClient = useQueryClient();
  const { getProductsByIds } = useProducts();
  const { wishlist, wishlistLoading } = useWishlist();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const firstName = user?.name?.split(" ")[0] || "Guest";

  const wishlistIds = useMemo(
    () =>
      wishlist
        .map((i) => String(i.productId))
        .sort()
        .join(","),
    [wishlist],
  );

  const prevWishlistIds = useRef("");

  const loadProducts = useCallback(async () => {
    if (!wishlist.length) {
      setProducts([]);
      setLoading(false);
      prevWishlistIds.current = "";
      return;
    }

    if (wishlistIds === prevWishlistIds.current) return;

    setLoading(true);

    try {
      const ids = wishlistIds.split(",").filter(Boolean);

      const cachedProducts = ids
        .map((id) => queryClient.getQueryData(["products", "id", id]))
        .filter(Boolean);

      const missingIds = ids.filter(
        (id) => !queryClient.getQueryData(["products", "id", id]),
      );

      let fetchedProducts = [];

      if (missingIds.length) {
        fetchedProducts = await getProductsByIds(missingIds);
      }

      const data = [...cachedProducts, ...fetchedProducts];

      setProducts(data.filter(Boolean));
      prevWishlistIds.current = wishlistIds;
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [wishlistIds, wishlist.length, getProductsByIds, queryClient]);

  useEffect(() => {
    if (!wishlistLoading) loadProducts();
  }, [wishlistLoading, loadProducts]);

  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  if (wishlistLoading || loading) return <WishlistSkeleton />;

  return (
    <main className="w-full bg-[#fcfcfc] min-h-screen mt-10 pt-5 md:mt-5  pb-24 font-sans selection:bg-[#da127d] selection:text-white">
      {/* Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-sm px-4">
          <NotificationProduct
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {products.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="max-w-[1400px] mx-auto  lg:px-5">
          {/* Breadcrumbs */}
          <div className="text-gray-500 text-sm flex flex-wrap gap-1 mb-4 px-4 md:px-0">
            <Link to="/" className="hover:text-gray-800">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-800 truncate max-w-[150px]">Mnmukt</span>
          </div>

          {/* Login Banner */}
          {!user && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-100 rounded-lg p-3 px-4 mb-6 mx-4 sm:mx-0">
              <LogIn size={18} className="text-gray-600 shrink-0" />
              <span className="text-gray-700 text-xs sm:text-sm">
                Please login to save your wishlist across devices.
              </span>
              <Link
                to="/auth/login"
                className="text-[#da127d] font-semibold uppercase text-xs sm:text-sm hover:underline">
                LOGIN
              </Link>
            </div>
          )}

          {/* Wishlist Header */}
          <header className="flex flex-col items-center text-center mb-16 px-4 md:px-0">
            <span className="text-[#da127d] text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-2">
              Personal Edit
            </span>

            <h1
              className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-gray-900 font-light mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              My Wishlist
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 tracking-wide">
              {products.length} saved{" "}
              {products.length === 1 ? "piece" : "pieces"}
            </p>
          </header>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-12 md:gap-x-6 md:gap-y-16">
            {products.map((product) => (
              <div key={product.id} className="group">
                <WishlistCard
                  product={product}
                  showNotification={showNotification}
                  onMoveToCart={() => setSelectedProduct(product)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md">
            <MoveToCartPopUp
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onCompleted={() => {
                showNotification("Moved to bag", "info");
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default WishlistPage;
