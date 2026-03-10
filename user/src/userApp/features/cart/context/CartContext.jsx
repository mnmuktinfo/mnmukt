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
  // console.log(cart);
  // Load cart from IndexedDB
  useEffect(() => {
    const loadCart = async () => {
      const data = await getCartDB();
      setCart(data || []);
      setLoading(false);
    };
    loadCart();
  }, []);

  // ✅ FIXED: Now handles variants (Same ID, different Size)
  const addToCart = async (productData) => {
    const { id, selectedSize, selectedQuantity = 1 } = productData;

    // 1. Check if this exact variation exists (Same ID AND Same Size)
    const existingItemIndex = cart.findIndex(
      (item) => item.id === id && item.selectedSize === selectedSize,
    );

    let newCart = [...cart];

    if (existingItemIndex !== -1) {
      // SCENARIO A: Item exists -> Increment Quantity
      newCart[existingItemIndex].selectedQuantity += selectedQuantity;

      // Update UI
      setCart(newCart);

      // Update DB (You might need a separate updateQuantityDB function here)
      // await updateCartQuantityDB(id, selectedSize, newCart[existingItemIndex].selectedQuantity);
    } else {
      // SCENARIO B: New Item -> Add to array
      const newItem = { id, selectedSize, selectedQuantity };
      newCart.push(newItem);

      // Update UI
      setCart(newCart);

      // Add to DB
      setSyncing(true);
      try {
        await addCartDB(newItem);
      } catch (error) {
        console.error("Failed to add to cart DB:", error);
      }
      setSyncing(false);
    }
  };
  // Update quantity
  const updateQuantity = async (id, selectedQuantity) => {
    if (selectedQuantity < 1) return;

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selectedQuantity } : i)),
    );

    setSyncing(true);
    await updateCartDB(id, { selectedQuantity });
    setSyncing(false);
  };

  // Update size
  const updateSize = async (id, selectedSize) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selectedSize } : i)),
    );

    setSyncing(true);
    try {
      await updateCartDB(id, { selectedSize });
    } catch (err) {
      console.error("Failed to update size in DB:", err);
    }
    setSyncing(false);
  };

  // Remove from cart
  const remove = async (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));

    setSyncing(true);
    await removeCartDB(id);
    setSyncing(false);
  };

  // Clear cart
  const clear = async () => {
    setCart([]);

    setSyncing(true);
    await clearCartDB();
    setSyncing(false);
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
