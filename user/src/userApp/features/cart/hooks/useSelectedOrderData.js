import { useMemo } from "react";

export const useSelectedOrderData = (cart, selectedIds) => {
  return useMemo(() => {
    const selectedItems = cart.filter((item) => selectedIds.includes(item.id));

    let subtotal = 0;
    let originalTotal = 0;

    selectedItems.forEach((item) => {
      subtotal += item.price * item.quantity;
      originalTotal += (item.originalPrice ?? item.price) * item.quantity;
    });

    return { selectedItems, subtotal, originalTotal };
  }, [cart, selectedIds]);
};
