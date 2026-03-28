import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "taruvedaCart";

export function TaruvedaCartProvider({ children }) {
  // ✅ Initialize from localStorage immediately
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Invalid cart data in localStorage");
      return {};
    }
  });

  // ✅ Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // ➕ Add to cart
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: {
          ...product,
          quantity: existing ? existing.quantity + qty : qty,
        },
      };
    });
  };

  // 🔄 Update quantity (delta-based, removes if qty <= 0)
  const updateCartQty = (productId, delta) => {
    setCart((prev) => {
      if (!prev[productId]) return prev;

      const newQty = prev[productId].quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }

      return {
        ...prev,
        [productId]: { ...prev[productId], quantity: newQty },
      };
    });
  };

  // ❌ Remove item
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // 🗑️ Clear entire cart
  const clearCart = () => setCart({});

  // 🧾 Helpers
  const getCartItems = () => Object.values(cart);

  const totalItems = useMemo(
    () => Object.values(cart).reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const totalPrice = useMemo(
    () =>
      Object.values(cart).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        getCartItems,
        totalItems,
        totalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
}
