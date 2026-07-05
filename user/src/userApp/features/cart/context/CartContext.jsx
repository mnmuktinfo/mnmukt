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

const isDev = process.env.NODE_ENV === "development";

const log = (...args) => {
  if (isDev) {
    console.log("[Cart]", ...args);
  }
};

const errorLog = (...args) => {
  if (isDev) {
    console.error("[Cart Error]", ...args);
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  /* ============================================
     LOAD CART
  ============================================ */

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);

        const data = await getCartDB();

        setCart(data ?? []);

        log("Cart loaded:", data);

        setError(null);
      } catch (err) {
        errorLog("Load failed:", err);

        setCart([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  /* ============================================
     VALIDATE ITEM
  ============================================ */

  const validateItem = (item) => {
    const required = ["productId", "name", "image", "price", "slug", "sku"];

    const missing = required.filter(
      (field) => !item[field] && item[field] !== 0,
    );

    if (missing.length) {
      errorLog(`Missing fields: ${missing.join(", ")}`, item);

      return false;
    }

    return true;
  };

  /* ============================================
     ADD TO CART
  ============================================ */

  const addToCart = useCallback(async (cartItemData) => {
    setSyncing(true);

    try {
      if (!cartItemData) {
        throw new Error("Invalid product");
      }

      const productId = cartItemData.productId || cartItemData.id;

      const selectedSize =
        cartItemData.selectedSize || cartItemData.variant?.size || "onesize";

      const quantity =
        cartItemData.quantity || cartItemData.selectedQuantity || 1;

      const normalizedItem = {
        ...cartItemData,

        productId,

        sku:
          cartItemData.sku ||
          `SKU-${String(productId).substring(0, 6).toUpperCase()}`,

        slug: cartItemData.slug || "",

        name: cartItemData.name || "",

        image: cartItemData.image || "",

        price: Number(cartItemData.price || 0),
      };

      if (!validateItem(normalizedItem)) {
        throw new Error("Product data incomplete");
      }

      const cartKey = `${productId}_${selectedSize}`;

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.cartKey === cartKey,
        );

        let updated;

        if (existingIndex !== -1) {
          updated = [...prev];

          const existing = updated[existingIndex];

          const newQuantity = existing.quantity + quantity;

          updated[existingIndex] = {
            ...existing,

            quantity: newQuantity,

            totalPrice: existing.price * newQuantity,
          };

          updateCartDB(cartKey, updated[existingIndex]);

          log("Quantity updated:", updated[existingIndex]);
        } else {
          const newItem = {
            cartKey,

            productId: String(productId),

            sku: normalizedItem.sku,

            slug: normalizedItem.slug,

            name: normalizedItem.name,

            image: normalizedItem.image,

            brand: cartItemData.brand || "",

            category:
              cartItemData.category || cartItemData.categoryId || "General",

            variant: {
              size: selectedSize,
              color: cartItemData.selectedColor || "",
            },

            quantity,

            price: normalizedItem.price,

            originalPrice: Number(
              cartItemData.originalPrice || normalizedItem.price,
            ),

            totalPrice: normalizedItem.price * quantity,

            addedAt: new Date().toISOString(),
          };

          updated = [...prev, newItem];

          addCartDB(newItem);

          log("Added new item:", newItem);
        }

        return updated;
      });

      setError(null);
    } catch (err) {
      errorLog("Add to cart:", err);

      setError(err.message);

      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     UPDATE QUANTITY
  ============================================ */

  const updateQuantity = useCallback(async (cartKey, quantity) => {
    setSyncing(true);

    try {
      if (quantity <= 0) {
        remove(cartKey);
        return;
      }

      setCart((prev) => {
        const updated = prev.map((item) =>
          item.cartKey === cartKey
            ? {
                ...item,
                quantity,

                totalPrice: item.price * quantity,
              }
            : item,
        );

        const item = updated.find((i) => i.cartKey === cartKey);

        if (item) {
          updateCartDB(cartKey, item);
        }

        log("Quantity updated:", item);

        return updated;
      });
    } catch (err) {
      errorLog("Quantity update:", err);

      setError("Failed updating quantity");
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     UPDATE SIZE
  ============================================ */

  const updateSize = useCallback(async (cartKey, newSize) => {
    if (!newSize) return;

    setSyncing(true);

    try {
      setCart((prev) => {
        const item = prev.find((i) => i.cartKey === cartKey);

        if (!item) return prev;

        const newKey = `${item.productId}_${newSize}`;

        const filtered = prev.filter((i) => i.cartKey !== cartKey);

        const updatedItem = {
          ...item,

          cartKey: newKey,

          variant: {
            ...item.variant,
            size: newSize,
          },
        };

        removeCartDB(cartKey).then(() => addCartDB(updatedItem));

        log("Size updated:", updatedItem);

        return [...filtered, updatedItem];
      });
    } catch (err) {
      errorLog("Size update:", err);

      setError("Failed updating size");
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     REMOVE
  ============================================ */

  const remove = useCallback(async (cartKey) => {
    setSyncing(true);

    try {
      setCart((prev) => prev.filter((i) => i.cartKey !== cartKey));

      await removeCartDB(cartKey);

      log("Removed:", cartKey);
    } catch (err) {
      errorLog("Remove:", err);
    } finally {
      setSyncing(false);
    }
  }, []);

  /* ============================================
     CLEAR
  ============================================ */

  const clear = useCallback(async () => {
    setSyncing(true);

    try {
      setCart([]);

      await clearCartDB();

      log("Cart cleared");
    } catch (err) {
      errorLog("Clear:", err);
    } finally {
      setSyncing(false);
    }
  }, []);

  const getTotal = useCallback(
    () => cart.reduce((sum, item) => sum + item.totalPrice, 0),
    [cart],
  );

  const getCount = useCallback(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
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
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
