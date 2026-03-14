import { createContext, useContext, useEffect, useState } from "react";
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

  /*
  ─────────────────────────────────────────
  Load cart from IndexedDB
  ─────────────────────────────────────────
  */
  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await getCartDB();
        setCart(data ?? []);
      } catch (err) {
        console.error("Failed to load cart:", err);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  /*
  ─────────────────────────────────────────
  Add to cart (variant-safe)
  ─────────────────────────────────────────
  */
  const addToCart = async (productData) => {
    const { id, selectedSize, selectedQuantity = 1 } = productData;

    const cartKey = `${id}_${selectedSize}`;

    setCart((prev) => {
      const index = prev.findIndex((item) => item.cartKey === cartKey);

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          selectedQuantity: updated[index].selectedQuantity + selectedQuantity,
        };

        updateCartDB(cartKey, {
          selectedQuantity: updated[index].selectedQuantity,
        }).catch((err) => console.error("Cart sync failed:", err));

        return updated;
      }

      const newItem = {
        cartKey,
        id,
        selectedSize,
        selectedQuantity,
      };

      addCartDB(newItem).catch((err) =>
        console.error("Cart DB add failed:", err),
      );

      return [...prev, newItem];
    });
  };

  /*
  ─────────────────────────────────────────
  Update quantity
  ─────────────────────────────────────────
  */
  const updateQuantity = async (cartKey, selectedQuantity) => {
    if (selectedQuantity < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey ? { ...item, selectedQuantity } : item,
      ),
    );

    updateCartDB(cartKey, { selectedQuantity }).catch((err) =>
      console.error("Cart quantity sync failed:", err),
    );
  };

  /*
  ─────────────────────────────────────────
  Update size (creates new variant)
  ─────────────────────────────────────────
  */
  const updateSize = async (cartKey, newSize) => {
    setCart((prev) => {
      const item = prev.find((i) => i.cartKey === cartKey);
      if (!item) return prev;

      const newCartKey = `${item.id}_${newSize}`;

      const updated = prev.filter((i) => i.cartKey !== cartKey);

      const existingVariant = updated.find((i) => i.cartKey === newCartKey);

      if (existingVariant) {
        existingVariant.selectedQuantity += item.selectedQuantity;
      } else {
        updated.push({
          ...item,
          cartKey: newCartKey,
          selectedSize: newSize,
        });
      }

      removeCartDB(cartKey).catch(() => {});
      addCartDB({
        ...item,
        cartKey: newCartKey,
        selectedSize: newSize,
      }).catch(() => {});

      return [...updated];
    });
  };

  /*
  ─────────────────────────────────────────
  Remove item
  ─────────────────────────────────────────
  */
  const remove = async (cartKey) => {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));

    removeCartDB(cartKey).catch((err) =>
      console.error("Cart remove failed:", err),
    );
  };

  /*
  ─────────────────────────────────────────
  Clear cart
  ─────────────────────────────────────────
  */
  const clear = async () => {
    setCart([]);

    clearCartDB().catch((err) => console.error("Cart clear failed:", err));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        syncing,
        addToCart,
        updateQuantity,
        updateSize,
        remove,
        clear,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
