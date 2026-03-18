import React, { useState, useMemo } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";

import OrderCard from "../features/orders/components/OrderCard";
import OrdersTabs from "../features/orders/components/OrdersTabs";
import OrdersSkeleton from "../features/orders/components/OrdersSkeleton";
import EmptyState from "../features/orders/components/EmptyState";
import ErrorState from "../features/orders/components/ErrorState";
import AuthRedirect from "../features/orders/components/AuthRedirect";

import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/* ── React Query Keys ── */
const ordersKeys = {
  all: (userId) => ["orders", userId],
};

/* ── Orders Page ── */
const OrdersPage = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.uid;
  console.log(userId);
  // Set "all" as the default active tab
  const [activeTab, setActiveTab] = useState("all");

  /* ── Fetch Orders with React Query ── */
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ordersKeys.all(userId),
    queryFn: async () => {
      if (!userId) return { orders: [] };
      const res = await orderService.getUserOrders(userId);
      return { orders: res.orders ?? [] };
    },
    enabled: !!userId && isLoggedIn,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const orders = data?.orders ?? [];
  // console.log(orders);
  console.log(orders);
  /* ── Memoize All / Active / Cancelled Orders ── */
  const { allOrders, activeOrders, cancelledOrders } = useMemo(() => {
    if (!orders?.length)
      return { allOrders: [], activeOrders: [], cancelledOrders: [] };

    const active = [];
    const cancelled = [];

    for (const order of orders) {
      const status = (order.orderStatus || "placed").toLowerCase();
      if (status === "cancelled") cancelled.push(order);
      else active.push(order);
    }

    return {
      allOrders: orders,
      activeOrders: active,
      cancelledOrders: cancelled,
    };
  }, [orders]);

  const displayedOrders =
    activeTab === "all"
      ? allOrders
      : activeTab === "active"
        ? activeOrders
        : cancelledOrders;

  /* ── Auth Guard ── */
  if (!isLoggedIn) return <AuthRedirect navigate={navigate} />;

  /* ── Refresh Orders Cache ── */
  const refreshOrders = async () => {
    await queryClient.invalidateQueries(ordersKeys.all(userId));
  };

  /* ── Optimistically update cache after order changes ── */
  const updateOrderInCache = (updatedOrder) => {
    queryClient.setQueryData(ordersKeys.all(userId), (oldData) => {
      if (!oldData) return { orders: [updatedOrder] };

      const ordersCopy = [...oldData.orders];
      const index = ordersCopy.findIndex(
        (o) => o.id === updatedOrder.id || o.orderId === updatedOrder.orderId,
      );

      if (index >= 0) {
        ordersCopy[index] = updatedOrder; // update existing order
      } else {
        ordersCopy.unshift(updatedOrder); // new order at top
      }

      return { orders: ordersCopy };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <header className="bg-white px-4 py-3 sm:py-4 shadow-sm sticky top-0 z-20">
        <div className="max-w-[720px] mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            My Orders
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <OrdersTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={{
            all: allOrders.length, // Passed the new count here
            active: activeOrders.length,
            cancelled: cancelledOrders.length,
          }}
        />

        {isLoading ? (
          <OrdersSkeleton />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : displayedOrders.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              navigate={navigate}
              isCancelled={activeTab === "cancelled"}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {displayedOrders.map((order, index) => (
              <OrderCard
                key={order.id || order.orderId || index}
                order={order}
                navigate={navigate}
                index={index}
                refreshOrders={refreshOrders}
                updateOrderInCache={updateOrderInCache}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
