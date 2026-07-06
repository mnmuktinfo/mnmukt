import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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
    console.log("🛒 [Cart]", ...args);
  }
};

const errorLog = (...args) => {
  if (isDev) {
    console.error("🚨 [Cart Error]", ...args);
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // 1. STATE REF: Always holds the absolute latest cart state to prevent stale closures
  const cartRef = useRef([]);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // 2. BROADCAST CHANNEL: Syncs cart across multiple browser tabs
  const channelRef = useRef(null);

  // 3. TASK QUEUE: Guarantees 1 Flow, 1 Truth. Prevents race conditions on rapid clicks.
  const taskQueue = useRef(Promise.resolve());

  /* ============================================
     LOAD CART (Single Source of Truth)
  ============================================ */
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCartDB();
      setCart(data ?? []);
      log("Cart loaded from DB:", data);
      setError(null);
    } catch (err) {
      errorLog("Load failed:", err);
      setCart([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============================================
     INITIALIZE & CROSS-TAB SYNC
  ============================================ */
  useEffect(() => {
    // Listen for updates from other tabs
    channelRef.current = new BroadcastChannel("cart_sync_channel");
    channelRef.current.onmessage = (event) => {
      if (event.data === "CART_MUTATED") {
        log("Cross-tab sync triggered, reloading...");
        loadCart();
      }
    };

    loadCart();

    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, [loadCart]);

  // Helper to notify other tabs that the DB has changed
  const broadcastUpdate = () => {
    if (channelRef.current) {
      channelRef.current.postMessage("CART_MUTATED");
    }
  };

  /* ============================================
     QUEUE RUNNER
  ============================================ */
  const runInQueue = useCallback((task) => {
    taskQueue.current = taskQueue.current.then(task).catch((err) => {
      errorLog("Queue Task Failed:", err);
      setError(err.message || "Action failed");
    });
    return taskQueue.current;
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
  const addToCart = useCallback(
    (cartItemData) => {
      return runInQueue(async () => {
        setSyncing(true);

        try {
          if (!cartItemData) throw new Error("Invalid product");

          const productId = cartItemData.productId || cartItemData.id;
          const selectedSize =
            cartItemData.selectedSize ||
            cartItemData.variant?.size ||
            "onesize";
          const quantity = Number(
            cartItemData.quantity || cartItemData.selectedQuantity || 1,
          );

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

          // Read strictly from the REF, guaranteeing we never use stale state
          const currentCart = cartRef.current;
          const existing = currentCart.find((item) => item.cartKey === cartKey);

          let itemToPersist;
          let updatedCart;

          if (existing) {
            const newQuantity = existing.quantity + quantity;
            itemToPersist = {
              ...existing,
              quantity: newQuantity,
              totalPrice: existing.price * newQuantity,
            };
            updatedCart = currentCart.map((item) =>
              item.cartKey === cartKey ? itemToPersist : item,
            );
          } else {
            itemToPersist = {
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
            updatedCart = [...currentCart, itemToPersist];
          }

          // 1. Update DB First (Single Source of Truth)
          if (existing) {
            await updateCartDB(cartKey, itemToPersist);
            log("Quantity updated:", itemToPersist);
          } else {
            await addCartDB(itemToPersist);
            log("Added new item:", itemToPersist);
          }

          // 2. Update React State
          setCart(updatedCart);
          setError(null);

          // 3. Notify other tabs
          broadcastUpdate();
        } finally {
          setSyncing(false);
        }
      });
    },
    [runInQueue],
  );

  /* ============================================
     UPDATE QUANTITY
  ============================================ */
  const updateQuantity = useCallback(
    (cartKey, quantity) => {
      return runInQueue(async () => {
        if (quantity <= 0) {
          await removeDBLogic(cartKey); // Extracted logic
          return;
        }

        setSyncing(true);
        try {
          const currentCart = cartRef.current;
          const item = currentCart.find((i) => i.cartKey === cartKey);
          if (!item) return;

          const updatedItem = {
            ...item,
            quantity,
            totalPrice: item.price * quantity,
          };

          const updatedCart = currentCart.map((i) =>
            i.cartKey === cartKey ? updatedItem : i,
          );

          await updateCartDB(cartKey, updatedItem);
          setCart(updatedCart);
          broadcastUpdate();

          log("Quantity updated:", updatedItem);
        } finally {
          setSyncing(false);
        }
      });
    },
    [runInQueue],
  );

  /* ============================================
     UPDATE SIZE
  ============================================ */
  const updateSize = useCallback(
    (cartKey, newSize) => {
      return runInQueue(async () => {
        if (!newSize) return;

        setSyncing(true);
        try {
          const currentCart = cartRef.current;
          const item = currentCart.find((i) => i.cartKey === cartKey);
          if (!item) return;

          const newKey = `${item.productId}_${newSize}`;
          const updatedItem = {
            ...item,
            cartKey: newKey,
            variant: { ...item.variant, size: newSize },
          };

          const updatedCart = [
            ...currentCart.filter((i) => i.cartKey !== cartKey),
            updatedItem,
          ];

          await removeCartDB(cartKey);
          await addCartDB(updatedItem);

          setCart(updatedCart);
          broadcastUpdate();

          log("Size updated:", updatedItem);
        } finally {
          setSyncing(false);
        }
      });
    },
    [runInQueue],
  );

  /* ============================================
     REMOVE
  ============================================ */
  // Separated to be reusable inside the queue without causing deadlocks
  const removeDBLogic = async (cartKey) => {
    setSyncing(true);
    try {
      await removeCartDB(cartKey);
      setCart((prev) => prev.filter((i) => i.cartKey !== cartKey));
      broadcastUpdate();
      log("Removed:", cartKey);
    } finally {
      setSyncing(false);
    }
  };

  const remove = useCallback(
    (cartKey) => {
      return runInQueue(() => removeDBLogic(cartKey));
    },
    [runInQueue],
  );

  /* ============================================
     CLEAR
  ============================================ */
  const clear = useCallback(() => {
    return runInQueue(async () => {
      setSyncing(true);
      try {
        await clearCartDB();
        setCart([]);
        broadcastUpdate();
        log("Cart cleared");
      } finally {
        setSyncing(false);
      }
    });
  }, [runInQueue]);

  /* ============================================
     DERIVED STATE
  ============================================ */
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
