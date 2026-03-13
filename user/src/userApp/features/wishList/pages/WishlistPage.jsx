import { useEffect, useState, useCallback } from "react";
import { useProducts } from "../../product/hook/useProducts";
import { useWishlist } from "../../../features/wishList/context/WishlistContext";
import EmptyWishlist from "./EmptyWishlist";
import MoveToCartPopUp from "../components/pop-up/MoveToCartPopUp";
import { WishlistCard } from "../components/cards/WishlistCard";
import NotificationProduct from "../../../components/cards/NotificationProduct";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const WishlistSkeleton = () => (
  <div className="max-w-9xl mt-15 md:mt-35 mx-auto px-1 md:px-4 py-3 md:py-5">
    <style>{`@keyframes wlPulse{0%,100%{opacity:.5}50%{opacity:.9}}`}</style>
    <div
      style={{
        height: 28,
        width: 160,
        background: "#E8E0D5",
        marginBottom: 24,
        marginLeft: 12,
        animation: "wlPulse 1.4s ease-in-out infinite",
      }}
    />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 8,
      }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#F4EFE7",
            aspectRatio: "3/4",
            animation: `wlPulse 1.4s ease-in-out ${i * 80}ms infinite`,
          }}
        />
      ))}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const WishlistPage = () => {
  // ✅ useProducts for fetching — batched, cached, IndexedDB-persisted
  const { getProductsByIds } = useProducts();

  // ✅ useWishlist for wishlist state (ids + loading flag)
  const { wishlist, wishlistLoading } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ─── Load wishlist products ──────────────────────────────────────────────
  // getProductsByIds is batched: all IDs → 1 Firestore call (chunked per 10).
  // On refresh, React Query returns them from IndexedDB → zero API calls.
  const loadProducts = useCallback(async () => {
    if (!wishlist.length) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const ids = wishlist.map((item) => item.productId);
      const prods = await getProductsByIds(ids); // ← was fetchProductsByIds
      setProducts(prods);
    } catch (err) {
      console.error("Failed to fetch wishlist products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [wishlist, getProductsByIds]);

  useEffect(() => {
    if (!wishlistLoading) loadProducts();
  }, [wishlistLoading, loadProducts]);

  // ─── Notification auto-dismiss ───────────────────────────────────────────
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 2200);
    return () => clearTimeout(t);
  }, [notification]);

  // ─── Guards ──────────────────────────────────────────────────────────────
  if (wishlistLoading || loading) return <WishlistSkeleton />;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-9xl mt-15 md:mt-35 mx-auto px-1 md:px-4 py-3 md:py-5">
      {notification && (
        <NotificationProduct
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={2200}
        />
      )}

      {products.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <>
          <h2 className="ml-3 text-[20px] font-[crimsonPro] uppercase mb-6">
            My Wishlist
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
            {products.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                showNotification={showNotification}
                onMoveToCart={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </>
      )}

      {selectedProduct && (
        <MoveToCartPopUp
          open
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onCompleted={() => {
            showNotification("Added to cart!", "success");
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default WishlistPage;
