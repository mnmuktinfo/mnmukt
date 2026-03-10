import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"

import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
} from "../firebase/firebaseCartService";

export const useCart = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load on login
  useEffect(() => {
    if (!uid) {
      setCart([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const items = await fetchCart(uid);
      setCart(items);
      setLoading(false);
    };

    load();
  }, [uid]);

  // Add to cart
  const add = async (item) => {
    if (!uid) return { error: "Login first" };

    const updated = await addToCart(uid, item);
    setCart(updated);
    return updated;
  };

  // Update quantity
  const update = async (cartItemId, qty) => {
    if (!uid) return { error: "Login first" };

    const updated = await updateQty(uid, cartItemId, qty);
    setCart(updated);
    return updated;
  };

  // Remove item
  const remove = async (cartItemId) => {
    if (!uid) return { error: "Login first" };

    const updated = await removeFromCart(uid, cartItemId);
    setCart(updated);
    return updated;
  };

  // Clear cart
  const empty = async () => {
    if (!uid) return;

    await clearCart(uid);
    setCart([]);
  };

  return {
    cart,
    loading,
    add,
    update,
    remove,
    empty,
    count: cart.length,
  };
};
