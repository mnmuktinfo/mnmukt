import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getCartDB,
  addCartDB,
  updateCartDB,
  removeCartDB,
  clearCartDB,
} from "../db/cartDB";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await getCartDB();
        setCart(data ?? []);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to load cart:", err);
        setError(err.message);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  /* ============================================
     VALIDATE PRODUCT DATA BEFORE ADDING
     ============================================ */
  const validateItem = (item) => {
    const required = ["productId", "name", "image", "price", "slug", "sku"];
    const missing = required.filter((field) => !item[field] && item[field] !== 0);

    if (missing.length > 0) {
      console.error(`Cannot add to cart. Missing fields: ${missing.join(", ")}`, item);
      return false;
    }
    return true;
  };

  /* ============================================
     ADD TO CART - WITH VALIDATION
     ============================================ */
  const addToCart = useCallback(async (cartItemData) => {
    setSyncing(true);
    try {
      if (!cartItemData) {
        throw new Error("Invalid product for cart addition");
      }

      // Handle both cases: id (legacy) vs productId (new)
      const productId = cartItemData.productId || cartItemData.id;
      const selectedSize = cartItemData.selectedSize || "onesize";
      const quantity = cartItemData.quantity || cartItemData.selectedQuantity || 1;

      if (!productId || !selectedSize) {
        throw new Error("Invalid product or size for cart addition");
      }

      const cartKey = `${productId}_${selectedSize}`;

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.cartKey === cartKey,
        );

        let updated;

        if (existingIndex !== -1) {
          // ✅ Item exists, increment quantity
          updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };

          updateCartDB(cartKey, updated[existingIndex])
            .then(() => setError(null))
            .catch((err) => {
              console.error("DB update error:", err);
              setError("Failed to update cart");
            });
        } else {
          // ✅ New item to cart - ensure all fields present
          const newItem = {
            cartKey,
            productId,
            name: cartItemData.name,
            image: cartItemData.image,
            price: cartItemData.price,
            originalPrice: cartItemData.originalPrice ?? cartItemData.price,
            category: cartItemData.category || cartItemData.categoryId || "General",
            slug: cartItemData.slug,
            quantity,
            selectedSize,
            selectedColor: cartItemData.selectedColor || null,
            meta: { sku: cartItemData.sku || `SKU-${productId.substring(0,6).toUpperCase()}` },
            addedAt: new Date().toISOString(),
          };

          updated = [...prev, newItem];

          addCartDB(newItem)
            .then(() => setError(null))
            .catch((err) => {
              console.error("DB add error:", err);
              setError("Failed to add to cart");
            });
        }

        return updated;
      });
    } catch (err) {
      console.error("❌ Add to cart error:", err);
      setError(err.message);
      throw err; // Re-throw for ProductCard to handle
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     UPDATE QUANTITY
     ============================================ */
  const updateQuantity = useCallback((cartKey, quantity) => {
    if (quantity < 1) {
      console.warn("⚠️ Quantity must be at least 1");
      return;
    }

    setSyncing(true);
    try {
      setCart((prev) => {
        const updated = prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity } : item,
        );

        const item = updated.find((i) => i.cartKey === cartKey);
        if (item) {
          updateCartDB(cartKey, item)
            .then(() => setError(null))
            .catch((err) => {
              console.error("DB update error:", err);
              setError("Failed to update quantity");
            });
        }

        return updated;
      });
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     UPDATE SIZE
     ============================================ */
  const updateSize = useCallback((cartKey, newSize) => {
    if (!newSize) {
      console.warn("⚠️ Size is required");
      return;
    }

    setSyncing(true);
    try {
      setCart((prev) => {
        const item = prev.find((i) => i.cartKey === cartKey);
        if (!item) {
          console.warn("⚠️ Cart item not found:", cartKey);
          return prev;
        }

        const newKey = `${item.productId}_${newSize}`;
        const filtered = prev.filter((i) => i.cartKey !== cartKey);
        const existing = filtered.find((i) => i.cartKey === newKey);

        if (existing) {
          // ✅ Merge with existing size
          existing.quantity += item.quantity;
          updateCartDB(newKey, existing)
            .then(() => setError(null))
            .catch((err) => {
              console.error("DB update error:", err);
              setError("Failed to update size");
            });
          return filtered;
        }

        const updatedItem = {
          ...item,
          cartKey: newKey,
          selectedSize: newSize,
        };

        addCartDB(updatedItem)
          .then(() => setError(null))
          .catch((err) => {
            console.error("DB add error:", err);
            setError("Failed to update size");
          });

        return [...filtered, updatedItem];
      });
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     REMOVE
     ============================================ */
  const remove = useCallback((cartKey) => {
    setSyncing(true);
    try {
      setCart((prev) => prev.filter((i) => i.cartKey !== cartKey));
      removeCartDB(cartKey)
        .then(() => setError(null))
        .catch((err) => {
          console.error("DB remove error:", err);
          setError("Failed to remove from cart");
        });
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     CLEAR
     ============================================ */
  const clear = useCallback(() => {
    setSyncing(true);
    try {
      setCart([]);
      clearCartDB()
        .then(() => setError(null))
        .catch((err) => {
          console.error("DB clear error:", err);
          setError("Failed to clear cart");
        });
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     GET CART TOTAL
     ============================================ */
  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
  }, [cart]);

  /* ============================================
     GET CART COUNT
     ============================================ */
  const getCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [cart]);

  const value = {
    cart,
    loading,
    syncing,
    error,
    addToCart,
    updateQuantity,
    updateSize,
    remove,
    clear,
    getTotal,
    getCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
