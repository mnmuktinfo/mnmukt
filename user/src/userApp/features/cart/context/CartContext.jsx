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
import { useAuth } from "../../auth/context/UserContext"; // 👈 adjust path if different

const CartContext = createContext();

const isDev = process.env.NODE_ENV === "development";
const log = (...args) => isDev && console.log("🛒 [Cart]", ...args);
const errorLog = (...args) =>
  isDev && console.error("🚨 [Cart Error]", ...args);

export const CartProvider = ({ children }) => {
  const { user, guestId, isLoggedIn } = useAuth();

  // Real scope: the account's uid if logged in, otherwise the
  // persistent per-device guestId (never the hardcoded "guest" string)
  const scope = isLoggedIn && user?.uid ? user.uid : guestId || "guest";

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const cartRef = useRef([]);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const scopeRef = useRef(scope);
  useEffect(() => {
    scopeRef.current = scope;
  }, [scope]);

  const channelRef = useRef(null);
  const taskQueue = useRef(Promise.resolve());

  const loadCart = useCallback(async (targetScope) => {
    try {
      setLoading(true);
      const data = await getCartDB(targetScope);
      setCart(data ?? []);
      setError(null);
    } catch (err) {
      errorLog("Load failed:", err);
      setCart([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const mergeGuestCartIntoUser = useCallback(async (fromScope, targetScope) => {
    const guestItems = await getCartDB(fromScope);
    if (!guestItems.length) return;

    const userItems = await getCartDB(targetScope);
    const userMap = new Map(userItems.map((i) => [i.cartKey, i]));

    for (const gItem of guestItems) {
      const existing = userMap.get(gItem.cartKey);
      if (existing) {
        const mergedQty = existing.quantity + gItem.quantity;
        await updateCartDB(targetScope, gItem.cartKey, {
          ...existing,
          quantity: mergedQty,
          totalPrice: existing.price * mergedQty,
        });
      } else {
        await addCartDB(targetScope, { ...gItem });
      }
    }

    await clearCartDB(fromScope);
    log(`Guest cart (${fromScope}) merged into ${targetScope}`);
  }, []);

  // prevScopeRef must start at the CURRENT guestId, not the literal "guest",
  // so the merge check below compares against the real guest identity
  const prevScopeRef = useRef(scope);

  useEffect(() => {
    const prevScope = prevScopeRef.current;

    const syncScope = async () => {
      // Only merge when moving FROM this device's actual guestId
      // TO a real logged-in uid — never on logout, never redundantly
      if (prevScope === guestId && scope !== guestId && scope === user?.uid) {
        await mergeGuestCartIntoUser(guestId, scope);
      }
      prevScopeRef.current = scope;
      await loadCart(scope);
    };

    syncScope();
  }, [scope, guestId, user?.uid, loadCart, mergeGuestCartIntoUser]);

  /* ============================================
     CROSS-TAB SYNC
  ============================================ */
  useEffect(() => {
    channelRef.current = new BroadcastChannel("cart_sync_channel");
    channelRef.current.onmessage = (event) => {
      if (event.data === "CART_MUTATED") {
        log("Cross-tab sync triggered, reloading...");
        loadCart(scopeRef.current);
      }
    };
    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, [loadCart]);

  const broadcastUpdate = () => {
    if (channelRef.current) channelRef.current.postMessage("CART_MUTATED");
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

  const validateItem = (item) => {
    const required = ["productId", "name", "image", "price", "slug", "sku"];
    const missing = required.filter((f) => !item[f] && item[f] !== 0);
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

          const currentScope = scopeRef.current;
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

          if (existing) {
            await updateCartDB(currentScope, cartKey, itemToPersist);
          } else {
            await addCartDB(currentScope, itemToPersist);
          }

          setCart(updatedCart);
          setError(null);
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
          await removeDBLogic(cartKey);
          return;
        }

        setSyncing(true);
        try {
          const currentScope = scopeRef.current;
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

          await updateCartDB(currentScope, cartKey, updatedItem);
          setCart(updatedCart);
          broadcastUpdate();
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
          const currentScope = scopeRef.current;
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

          await removeCartDB(currentScope, cartKey);
          await addCartDB(currentScope, updatedItem);

          setCart(updatedCart);
          broadcastUpdate();
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
  const removeDBLogic = async (cartKey) => {
    setSyncing(true);
    try {
      const currentScope = scopeRef.current;
      await removeCartDB(currentScope, cartKey);
      setCart((prev) => prev.filter((i) => i.cartKey !== cartKey));
      broadcastUpdate();
    } finally {
      setSyncing(false);
    }
  };

  const remove = useCallback(
    (cartKey) => runInQueue(() => removeDBLogic(cartKey)),
    [runInQueue],
  );

  /* ============================================
     CLEAR
  ============================================ */
  const clear = useCallback(() => {
    return runInQueue(async () => {
      setSyncing(true);
      try {
        await clearCartDB(scopeRef.current);
        setCart([]);
        broadcastUpdate();
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

  const removePurchasedItems = useCallback(
    async (purchasedItems) => {
      return runInQueue(async () => {
        setSyncing(true);
        try {
          const currentScope = scopeRef.current;
          const keys = new Set(
            purchasedItems.map((item) => {
              const size = item.variant?.size || item.selectedSize || "onesize";
              return `${item.productId}_${size}`;
            }),
          );

          for (const key of keys) {
            await removeCartDB(currentScope, key);
          }

          setCart((prev) => prev.filter((item) => !keys.has(item.cartKey)));
          broadcastUpdate();
        } finally {
          setSyncing(false);
        }
      });
    },
    [runInQueue],
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
        removePurchasedItems,
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
