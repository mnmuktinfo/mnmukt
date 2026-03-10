import React, { createContext, useContext, useEffect, useState } from "react";

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

  // 🔄 Update quantity
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

  // 🧾 Helpers
  const getCartItems = () => Object.values(cart);

  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalPrice = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        getCartItems,
        totalItems,
        totalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
}
