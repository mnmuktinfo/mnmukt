import React, { useState, useMemo } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import OrderCard from "../features/orders/components/OrderCard";
import AuthRedirect from "../features/orders/components/AuthRedirect";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag, AlertTriangle } from "lucide-react";
import { OrderService } from "../features/orders/services/api/orderService";

/* ── React Query Keys ── */
const ordersKeys = {
  all: (userId) => ["orders", userId],
};

/* ── Skeleton Card (Standard E-commerce Style) ── */
const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-4 p-4 animate-pulse">
    {/* Header */}
    <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
      <div>
        <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-2 w-32 bg-gray-100 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
    </div>

    {/* Body */}
    <div className="flex gap-4">
      <div className="w-20 h-20 bg-gray-200 rounded shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
        <div className="h-4 w-1/4 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  </div>
);

/* ── OrdersPage ── */
const OrdersPage = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.uid;

  const [activeTab, setActiveTab] = useState("all");

  /* ── Fetch Orders ── */
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ordersKeys.all(userId),
    queryFn: async () => {
      if (!userId) return { orders: [] };
      const res = await OrderService.getUserOrders();
      return { orders: Array.isArray(res) ? res : [] };
    },
    enabled: !!userId && isLoggedIn,
    staleTime: 3 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const orders = data?.orders ?? [];

  /* ── Tab buckets ── */
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

  /* ── Cache helpers ── */
  const refreshOrders = async () => {
    await queryClient.invalidateQueries(ordersKeys.all(userId));
  };

  const updateOrderInCache = (updatedOrder) => {
    queryClient.setQueryData(ordersKeys.all(userId), (oldData) => {
      if (!oldData) return { orders: [updatedOrder] };
      const copy = [...oldData.orders];
      const idx = copy.findIndex(
        (o) => o.id === updatedOrder.id || o.orderId === updatedOrder.orderId,
      );
      if (idx >= 0) copy[idx] = updatedOrder;
      else copy.unshift(updatedOrder);
      return { orders: copy };
    });
  };

  /* ── Tabs config ── */
  const tabs = [
    { key: "all", label: "All Orders", count: allOrders.length },
    { key: "active", label: "Active", count: activeOrders.length },
    { key: "cancelled", label: "Cancelled", count: cancelledOrders.length },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20 selection:bg-pink-100 selection:text-pink-900">
      {/* ── Sticky Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        {/* Title Row */}
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-gray-700 hover:text-[#f43397] transition-colors focus:outline-none"
            aria-label="Go back">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-base font-semibold text-gray-900">My Orders</h1>
        </div>

        {/* Tabs Row */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative py-3 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "text-[#f43397]"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                {tab.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-pink-50 text-[#f43397]"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                  {tab.count}
                </span>

                {/* Active Indicator Line */}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f43397] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="mt-20 flex flex-col items-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Failed to load orders
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              We couldn't fetch your order history. Please check your internet
              connection.
            </p>
            <button
              onClick={refetch}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#f43397] rounded-md hover:bg-[#e02b88] transition-colors">
              Try Again
            </button>
          </div>
        ) : displayedOrders.length === 0 ? (
          /* Empty State */
          <div className="mt-20 flex flex-col items-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4 border border-pink-100">
              <ShoppingBag size={28} className="text-[#f43397]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {activeTab === "cancelled"
                ? "No cancelled orders"
                : "No orders found"}
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              {activeTab === "cancelled"
                ? "You don't have any cancelled orders right now."
                : "Looks like you haven't placed an order yet. Start exploring our collections!"}
            </p>
            {activeTab !== "cancelled" && (
              <button
                onClick={() => navigate("/")}
                className="px-8 py-2.5 text-sm font-medium text-white bg-[#f43397] rounded-md hover:bg-[#e02b88] transition-colors w-full sm:w-auto">
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          /* Order List */
          <div className="flex flex-col gap-3 sm:gap-4">
            {displayedOrders.map((order, index) => (
              <OrderCard
                key={order.id || order.orderId || index}
                order={order}
                navigate={navigate}
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
