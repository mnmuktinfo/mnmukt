import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getWishlistDB,
  addWishlistDB,
  removeWishlistDB,
  clearWishlistDB,
} from "../db/wishlistDB";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // ─── Load from local DB on mount ──────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadWishlist = async () => {
      setLoading(true);
      try {
        const data = await getWishlistDB();
        if (mounted) setWishlist(data || []);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        if (mounted) setWishlist([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWishlist();
    return () => {
      mounted = false;
    };
  }, []);

  // ─── Check if item is wishlisted ──────────────────────────────────────────
  // Defined early so toggleWishlist can use it
  const isWishlisted = useCallback(
    (productId) => wishlist.some((i) => i.productId === productId?.toString()),
    [wishlist],
  );

  // ─── Add item ─────────────────────────────────────────────────────────────
  // ✅ FIX: always normalize to string id before calling DB
  const add = useCallback(
    async (productId) => {
      const id = (
        typeof productId === "object" ? productId?.id : productId
      )?.toString();
      if (!id) return console.error("add(): invalid productId", productId);
      if (isWishlisted(id)) return; // already in wishlist, skip

      // Optimistic update — instant UI response
      const optimisticItem = { productId: id };
      setWishlist((prev) => [...prev, optimisticItem]);
      setSyncing(true);

      try {
        const savedItem = await addWishlistDB(id);
        // Replace optimistic item with real DB item (may have extra fields like timestamps)
        setWishlist((prev) =>
          prev.map((i) => (i.productId === id ? savedItem : i)),
        );
      } catch (err) {
        // Rollback on failure
        console.error("Failed to add to wishlist:", err);
        setWishlist((prev) => prev.filter((i) => i.productId !== id));
      } finally {
        setSyncing(false);
      }
    },
    [isWishlisted],
  );

  // ─── Remove item ──────────────────────────────────────────────────────────
  // ✅ FIX: optimistic removal — instant UI, rollback on error
  const removeFromWishlist = useCallback(
    async (productId) => {
      const id = productId?.toString();
      if (!id) return;

      // Snapshot for rollback
      const snapshot = wishlist.find((i) => i.productId === id);

      // Optimistic update
      setWishlist((prev) => prev.filter((i) => i.productId !== id));
      setSyncing(true);

      try {
        await removeWishlistDB(id);
      } catch (err) {
        // Rollback
        console.error("Failed to remove from wishlist:", err);
        if (snapshot) setWishlist((prev) => [...prev, snapshot]);
      } finally {
        setSyncing(false);
      }
    },
    [wishlist],
  );

  // ─── Toggle ───────────────────────────────────────────────────────────────
  // ✅ FIX: pass normalized id to both branches (no dual-path confusion)
  const toggleWishlist = useCallback(
    async (productId) => {
      const id = productId?.toString();
      if (!id) return;
      return isWishlisted(id) ? removeFromWishlist(id) : add(id);
    },
    [isWishlisted, add, removeFromWishlist],
  );

  // ─── Clear all ────────────────────────────────────────────────────────────
  const clear = useCallback(async () => {
    const snapshot = [...wishlist]; // snapshot for rollback
    setWishlist([]); // optimistic
    setSyncing(true);

    try {
      await clearWishlistDB();
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
      setWishlist(snapshot); // rollback
    } finally {
      setSyncing(false);
    }
  }, [wishlist]);

  // ─── Context value ────────────────────────────────────────────────────────
  const value = {
    wishlist,
    loading,
    wishlistLoading: loading, // ✅ FIX: alias so WishlistPage works without changes
    syncing,
    count: wishlist.length,
    add,
    removeFromWishlist,
    toggleWishlist,
    clear,
    isWishlisted,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
};
