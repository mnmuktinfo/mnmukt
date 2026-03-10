import { createContext, useContext, useEffect, useState } from "react";
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

  /* -------------------------
     LOAD WISHLIST FROM LOCAL DB
  -------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadWishlist = async () => {
      setLoading(true);
      try {
        const data = await getWishlistDB();
        if (mounted) setWishlist(data || []);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWishlist();
    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------
     ADD ITEM TO WISHLIST
  -------------------------- */
  const add = async (product) => {
    setSyncing(true);
    try {
      const productId = typeof product === "object" ? product.id : product;
      if (!productId) throw new Error("Invalid productId");

      const id = productId.toString();
      const item = await addWishlistDB(id);
      setWishlist((prev) => [...prev, item]);
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    } finally {
      setSyncing(false);
    }
  };

  /* -------------------------
     REMOVE ITEM FROM WISHLIST
  -------------------------- */
  const removeFromWishlist = async (productId) => {
    setSyncing(true);
    try {
      const id = productId.toString();
      await removeWishlistDB(id);
      setWishlist((prev) => prev.filter((i) => i.productId !== id));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    } finally {
      setSyncing(false);
    }
  };

  /* -------------------------
     TOGGLE WISHLIST ITEM
  -------------------------- */
  const toggleWishlist = async (productId) => {
    const id = productId?.toString();
    return isWishlisted(id) ? removeFromWishlist(id) : add(id);
  };

  /* -------------------------
     CLEAR WISHLIST
  -------------------------- */
  const clear = async () => {
    setSyncing(true);
    try {
      await clearWishlistDB();
      setWishlist([]);
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
    } finally {
      setSyncing(false);
    }
  };

  /* -------------------------
     CHECK IF ITEM IS WISHLISTED
  -------------------------- */
  const isWishlisted = (productId) =>
    wishlist.some((i) => i.productId === productId?.toString());

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        syncing,
        count: wishlist.length,
        add,
        removeFromWishlist,
        toggleWishlist,
        clear,
        isWishlisted,
      }}>
      {children}
    </WishlistContext.Provider>
  );
};

/* -------------------------
   CUSTOM HOOK
-------------------------- */
export const useWishlist = () => useContext(WishlistContext);
