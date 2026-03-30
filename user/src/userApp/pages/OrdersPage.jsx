import React, { useState, useMemo } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../features/orders/services/orderService";
import OrderCard, {
  DUMMY_ORDERS,
} from "../features/orders/components/OrderCard";
import AuthRedirect from "../features/orders/components/AuthRedirect";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ShoppingBag } from "lucide-react";

/* ── React Query Keys ── */
const ordersKeys = {
  all: (userId) => ["orders", userId],
};

/* ── Upgraded Skeleton Card (Matches New OrderCard Design) ── */
const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse mb-6 sm:mb-8">
    {/* Header Skeleton */}
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:flex md:gap-12 w-full md:w-auto">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-2.5 w-16 bg-gray-200 rounded mb-2.5" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-28 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="h-10 w-28 bg-gray-200 rounded-lg flex-shrink-0 hidden sm:block" />
      </div>
    </div>

    {/* Body Skeleton */}
    <div className="flex flex-col sm:flex-row gap-6 px-4 sm:px-6 py-6">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between gap-4 mb-3">
          <div className="h-5 bg-gray-200 rounded w-1/2 sm:w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="h-4 bg-gray-200 rounded w-24 sm:w-32" />
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-20 hidden sm:block" />
          </div>
        </div>
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
      const res = await orderService.getUserOrders(userId);
      return { orders: res.orders ?? [] };
    },
    enabled: !!userId && isLoggedIn,
    staleTime: 3 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Use real orders if available, DUMMY_ORDERS only as dev preview fallback
  const orders = data?.orders?.length ? data.orders : DUMMY_ORDERS;

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
    <div className="min-h-screen bg-[#f9fafb] pb-24 font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* ── Sticky Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        {/* Title Row */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 py-4 sm:py-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3F6C]"
            aria-label="Go back">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Order History
          </h1>
        </div>

        {/* Tabs Row */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar gap-6 sm:gap-8 border-t border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 py-4 text-sm font-semibold transition-colors whitespace-nowrap focus:outline-none ${
                  activeTab === tab.key
                    ? "text-[#FF3F6C]"
                    : "text-gray-500 hover:text-gray-900"
                }`}>
                {tab.label}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full leading-none transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#fff0f3] text-[#FF3F6C]"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                  {tab.count}
                </span>
                {/* Active Indicator Line */}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF3F6C] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {isLoading ? (
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="mt-16 sm:mt-24 flex flex-col items-center text-center px-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 shadow-sm border border-red-100">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              We encountered an unexpected issue while loading your orders.
              Please check your connection and try again.
            </p>
            <button
              onClick={refetch}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#FF3F6C] rounded-lg hover:bg-[#d93059] active:scale-95 transition-all w-full sm:w-auto shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3F6C]">
              Try Again
            </button>
          </div>
        ) : displayedOrders.length === 0 ? (
          /* Empty State */
          <div className="mt-16 sm:mt-24 flex flex-col items-center text-center px-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#fff0f3] flex items-center justify-center mb-6 shadow-sm border border-pink-50">
              <ShoppingBag size={32} className="text-[#FF3F6C]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === "cancelled"
                ? "No cancelled orders"
                : "No orders placed yet"}
            </h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              {activeTab === "cancelled"
                ? "You haven't cancelled any orders yet. All your active and completed orders will appear in the other tabs."
                : "Looks like your order history is empty. Start shopping to fill this space with your favorite items!"}
            </p>
            {activeTab !== "cancelled" && (
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#FF3F6C] rounded-lg hover:bg-[#d93059] active:scale-95 transition-all w-full sm:w-auto shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3F6C]">
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          /* Order List */
          <div className="flex flex-col gap-6 sm:gap-8 transition-all duration-300 ease-in-out">
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
