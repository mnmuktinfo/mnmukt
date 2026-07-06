import { createContext, useContext, useState, useCallback } from "react";

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("current_order");
        return saved ? JSON.parse(saved) : null;
      } catch (err) {
        return null;
      }
    }
    return null;
  });

  const [orderHistory, setOrderHistory] = useState([]);

  const storeOrder = useCallback((order) => {
    setCurrentOrder(order);
    setOrderHistory((prev) => [order, ...prev]);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_order", JSON.stringify(order));
    }
  }, []);

  const updateOrder = useCallback((orderId, updates) => {
    setCurrentOrder((prev) => {
      if (prev?.orderId === orderId || prev?._id === orderId) {
        const updatedOrder = { ...prev, ...updates };
        if (typeof window !== "undefined") {
          sessionStorage.setItem("current_order", JSON.stringify(updatedOrder));
        }
        return updatedOrder;
      }
      return prev;
    });

    setOrderHistory((prev) =>
      prev.map((order) =>
        order.orderId === orderId || order._id === orderId
          ? { ...order, ...updates }
          : order,
      ),
    );
  }, []);

  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_order");
    }
  }, []);

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        orderHistory,
        storeOrder,
        updateOrder,
        clearCurrentOrder,
      }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context)
    throw new Error("useOrder must be used within an OrderProvider");
  return context;
};
