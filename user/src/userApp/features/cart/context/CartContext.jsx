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
  Add to cart
  ─────────────────────────────────────────
  */
  const addToCart = async (productData) => {
    const { id, selectedSize, selectedQuantity = 1 } = productData;
    const cartKey = `${id}_${selectedSize}`;

    setCart((prev) => {
      const index = prev.findIndex((item) => item.cartKey === cartKey);
      let updatedCart;

      if (index !== -1) {
        updatedCart = [...prev];
        updatedCart[index] = {
          ...updatedCart[index],
          selectedQuantity:
            updatedCart[index].selectedQuantity + selectedQuantity,
        };

        // FIX: Pass the FULL updated object to the DB
        updateCartDB(cartKey, updatedCart[index]).catch((err) =>
          console.error("Cart sync failed:", err),
        );
      } else {
        const newItem = { cartKey, id, selectedSize, selectedQuantity };
        updatedCart = [...prev, newItem];

        addCartDB(newItem).catch((err) =>
          console.error("Cart DB add failed:", err),
        );
      }

      return updatedCart;
    });
  };

  /*
  ─────────────────────────────────────────
  Update quantity
  ─────────────────────────────────────────
  */
  const updateQuantity = async (cartKey, selectedQuantity) => {
    if (selectedQuantity < 1) return;

    setCart((prev) => {
      const index = prev.findIndex((item) => item.cartKey === cartKey);
      if (index === -1) return prev;

      const updatedCart = [...prev];
      updatedCart[index] = { ...updatedCart[index], selectedQuantity };

      // FIX: Pass the FULL updated object to prevent overwriting the ID
      updateCartDB(cartKey, updatedCart[index]).catch((err) =>
        console.error("Cart quantity sync failed:", err),
      );

      return updatedCart;
    });
  };

  /*
  ─────────────────────────────────────────
  Update size
  ─────────────────────────────────────────
  */
  const updateSize = async (cartKey, newSize) => {
    setCart((prev) => {
      const itemIndex = prev.findIndex((i) => i.cartKey === cartKey);
      if (itemIndex === -1) return prev;

      const item = prev[itemIndex];
      const newCartKey = `${item.id}_${newSize}`;
      const updated = prev.filter((i) => i.cartKey !== cartKey);
      const existingVariant = updated.find((i) => i.cartKey === newCartKey);

      let finalItemToSave;

      if (existingVariant) {
        existingVariant.selectedQuantity += item.selectedQuantity;
        finalItemToSave = existingVariant;

        updateCartDB(newCartKey, existingVariant).catch(() => {});
      } else {
        finalItemToSave = {
          ...item,
          cartKey: newCartKey,
          selectedSize: newSize,
        };
        updated.push(finalItemToSave);

        addCartDB(finalItemToSave).catch(() => {});
      }

      removeCartDB(cartKey).catch(() => {});

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
