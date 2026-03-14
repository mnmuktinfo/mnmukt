import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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

  /* sync operation counter */
  const syncOps = useRef(0);
  const [syncing, setSyncing] = useState(false);

  const startSync = () => {
    syncOps.current += 1;
    setSyncing(true);
  };

  const endSync = () => {
    syncOps.current -= 1;
    if (syncOps.current <= 0) {
      syncOps.current = 0;
      setSyncing(false);
    }
  };

  /*
  ───────────────── Load wishlist
  ─────────────────
  */
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

  /*
  ───────────────── Check wishlisted
  ─────────────────
  */
  const isWishlisted = useCallback(
    (productId) => wishlist.some((i) => i.productId === productId?.toString()),
    [wishlist],
  );

  /*
  ───────────────── Add item
  ─────────────────
  */
  const add = useCallback(
    async (productId) => {
      const id =
        typeof productId === "object"
          ? productId?.id?.toString()
          : productId?.toString();

      if (!id) return console.error("add(): invalid productId", productId);

      if (wishlist.some((i) => i.productId === id)) return;

      const optimisticItem = { productId: id };

      setWishlist((prev) => [...prev, optimisticItem]);

      startSync();

      try {
        const savedItem = await addWishlistDB(id);

        setWishlist((prev) =>
          prev.map((i) => (i.productId === id ? savedItem : i)),
        );
      } catch (err) {
        console.error("Failed to add wishlist:", err);

        setWishlist((prev) => prev.filter((i) => i.productId !== id));
      } finally {
        endSync();
      }
    },
    [wishlist],
  );

  /*
  ───────────────── Remove item
  ─────────────────
  */
  const removeFromWishlist = useCallback(async (productId) => {
    const id = productId?.toString();
    if (!id) return;

    let snapshot;

    setWishlist((prev) => {
      snapshot = prev.find((i) => i.productId === id);
      return prev.filter((i) => i.productId !== id);
    });

    startSync();

    try {
      await removeWishlistDB(id);
    } catch (err) {
      console.error("Failed to remove wishlist:", err);

      if (snapshot) {
        setWishlist((prev) => [...prev, snapshot]);
      }
    } finally {
      endSync();
    }
  }, []);

  /*
  ───────────────── Toggle
  ─────────────────
  */
  const toggleWishlist = useCallback(
    (productId) => {
      const id = productId?.toString();
      if (!id) return;

      return isWishlisted(id) ? removeFromWishlist(id) : add(id);
    },
    [isWishlisted, add, removeFromWishlist],
  );

  /*
  ───────────────── Clear all
  ─────────────────
  */
  const clear = useCallback(async () => {
    const snapshot = [...wishlist];

    setWishlist([]);

    startSync();

    try {
      await clearWishlistDB();
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
      setWishlist(snapshot);
    } finally {
      endSync();
    }
  }, [wishlist]);

  /*
  ───────────────── Context value
  ─────────────────
  */
  const value = {
    wishlist,
    loading,
    wishlistLoading: loading,
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

/*
──────────────── Hook
────────────────
*/
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);

  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");

  return ctx;
};
