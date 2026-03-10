import { useState } from "react";
import { createOrder, fetchUserOrders } from "../firebase/firebaseOrdersService";

export const useOrder = () => {
  const [loading, setLoading] = useState(false);

  const placeOrder = async (orderId, data) => {
    setLoading(true);

    try {
      const id = await createOrder(orderId, data);
      setLoading(false);
      return { success: true, orderId: id };
    } catch (e) {
      console.error("Order Error:", e);
      setLoading(false);
      return { success: false };
    }
  };

  const getOrders = async (userId) => {
    setLoading(true);
    const orders = await fetchUserOrders(userId);
    setLoading(false);
    return orders;
  };

  return {
    loading,
    placeOrder,
    getOrders,
  };
};
