import React, { createContext, useContext, useState, useCallback } from "react";

const OrderContext = createContext();

/**
 * Order Provider - Manages order data globally
 * Stores both current order and order history
 */
export const OrderProvider = ({ children }) => {
  // Current order being processed
  const [currentOrder, setCurrentOrder] = useState(null);

  // Order history for reference
  const [orderHistory, setOrderHistory] = useState([]);

  /**
   * Store new order in context
   * Called immediately after order creation
   */
  const storeOrder = useCallback((orderData) => {
    if (!orderData?.orderId) {
      console.error("Invalid order data - missing orderId");
      return;
    }

    const enrichedOrder = {
      ...orderData,
      storedAt: new Date().toISOString(),
    };

    // Update current order
    setCurrentOrder(enrichedOrder);

    // Add to history
    setOrderHistory((prev) => {
      // Avoid duplicates
      const filtered = prev.filter((o) => o.orderId !== orderData.orderId);
      return [enrichedOrder, ...filtered];
    });

    // Also store in localStorage as backup
    try {
      localStorage.setItem(
        `order_${orderData.orderId}`,
        JSON.stringify(enrichedOrder),
      );
    } catch (e) {
      console.warn("Failed to store order in localStorage", e);
    }

    console.log("✅ Order stored in context:", orderData.orderId);
  }, []);

  /**
   * Get specific order from history
   */
  const getOrder = useCallback(
    (orderId) => {
      if (!orderId) return null;

      // Check context first (fastest)
      const contextOrder = orderHistory.find((o) => o.orderId === orderId);
      if (contextOrder) {
        return contextOrder;
      }

      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`order_${orderId}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Failed to retrieve order from localStorage", e);
      }

      return null;
    },
    [orderHistory],
  );

  /**
   * Update specific order in context
   * Used after payment verification
   */
  const updateOrder = useCallback((orderId, updates) => {
    if (!orderId) {
      console.error("Order ID required for update");
      return;
    }

    setCurrentOrder((prev) => {
      if (!prev || prev.orderId !== orderId) return prev;
      return { ...prev, ...updates };
    });

    setOrderHistory((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, ...updates } : order,
      ),
    );

    // Update localStorage
    try {
      const stored = localStorage.getItem(`order_${orderId}`);
      if (stored) {
        const updated = JSON.parse(stored);
        localStorage.setItem(
          `order_${orderId}`,
          JSON.stringify({
            ...updated,
            ...updates,
          }),
        );
      }
    } catch (e) {
      console.warn("Failed to update order in localStorage", e);
    }

    console.log("✅ Order updated:", orderId);
  }, []);

  /**
   * Get current order (the one being processed)
   */
  const getCurrentOrder = useCallback(() => {
    return currentOrder;
  }, [currentOrder]);

  /**
   * Clear current order (after successful checkout)
   */
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  /**
   * Get all orders from history
   */
  const getOrderHistory = useCallback(() => {
    return orderHistory;
  }, [orderHistory]);

  /**
   * Clear specific order from localStorage
   */
  const clearOrderFromStorage = useCallback((orderId) => {
    try {
      localStorage.removeItem(`order_${orderId}`);
    } catch (e) {
      console.warn("Failed to clear order from localStorage", e);
    }
  }, []);

  const value = {
    // Current order
    currentOrder,
    getCurrentOrder,
    clearCurrentOrder,

    // Order history
    orderHistory,
    getOrderHistory,

    // CRUD operations
    storeOrder,
    getOrder,
    updateOrder,

    // Storage
    clearOrderFromStorage,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

/**
 * Hook to use Order context
 */
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
};
