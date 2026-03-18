import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "./orderService";
import { useEffect } from "react";

export const useOrder = (orderId) => {
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 10 * 60 * 1000, // 10 mins
    gcTime: 30 * 60 * 1000,    // React Query v5 uses gcTime instead of cacheTime
    
    // 1. Pull from existing list cache to avoid a new API call
    initialData: () => {
      // Logic: Look through all "orders" queries to find this specific order
      return queryClient
        .getQueryData(["orders"]) // Adjust key if you use ["orders", userId]
        ?.find((d) => d.id === orderId);
    },
    initialDataUpdatedAt: () => 
      queryClient.getQueryState(["orders"])?.dataUpdatedAt,
  });

  // 2. Conditional Prefetching
  useEffect(() => {
    if (order?.userId) {
      const userOrdersKey = ["orders", order.userId];
      
      // Only prefetch if we don't have the data OR if it's considered stale
      if (!queryClient.getQueryData(userOrdersKey)) {
        queryClient.prefetchQuery({
          queryKey: userOrdersKey,
          queryFn: () => orderService.getUserOrders(order.userId),
          staleTime: 5 * 60 * 1000, 
        });
      }
    }
  }, [order?.userId, queryClient]);

  return { order, isLoading, error };
};