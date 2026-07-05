// src/features/orders/context/OrderContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const OrderContext = createContext(null);

const safeStorage = {
  get: (key) => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(key, value);
    } catch {
      /* quota exceeded or storage disabled — non-fatal, context still holds the order */
    }
  },
  remove: (key) => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem(key);
    } catch {
      /* no-op */
    }
  },
};

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  const storeOrder = useCallback((orderData) => {
    if (!orderData?.orderId) return;

    const enrichedOrder = { ...orderData, storedAt: new Date().toISOString() };
    setCurrentOrder(enrichedOrder);
    setOrderHistory((prev) => [
      enrichedOrder,
      ...prev.filter((o) => o.orderId !== orderData.orderId),
    ]);
    safeStorage.set(
      `order_${orderData.orderId}`,
      JSON.stringify(enrichedOrder),
    );
  }, []);

  const getOrder = useCallback(
    (orderId) => {
      if (!orderId) return null;
      const contextOrder = orderHistory.find((o) => o.orderId === orderId);
      if (contextOrder) return contextOrder;

      const stored = safeStorage.get(`order_${orderId}`);
      if (!stored) return null;
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    },
    [orderHistory],
  );

  const updateOrder = useCallback((orderId, updates) => {
    if (!orderId) return;

    setCurrentOrder((prev) =>
      prev?.orderId === orderId ? { ...prev, ...updates } : prev,
    );
    setOrderHistory((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...updates } : o)),
    );

    const stored = safeStorage.get(`order_${orderId}`);
    if (stored) {
      try {
        safeStorage.set(
          `order_${orderId}`,
          JSON.stringify({ ...JSON.parse(stored), ...updates }),
        );
      } catch {
        /* corrupted entry — ignore */
      }
    }
  }, []);

  const getCurrentOrder = useCallback(() => currentOrder, [currentOrder]);
  const clearCurrentOrder = useCallback(() => setCurrentOrder(null), []);
  const getOrderHistory = useCallback(() => orderHistory, [orderHistory]);
  const clearOrderFromStorage = useCallback(
    (orderId) => safeStorage.remove(`order_${orderId}`),
    [],
  );

  const value = {
    currentOrder,
    getCurrentOrder,
    clearCurrentOrder,
    orderHistory,
    getOrderHistory,
    storeOrder,
    getOrder,
    updateOrder,
    clearOrderFromStorage,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder must be used within OrderProvider");
  return context;
};
