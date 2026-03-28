import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "../features/orders/services/orderService";
import { formatDate } from "../features/orders/utils/orders";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Star,
  MapPin,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Navigation,
  HelpCircle,
} from "lucide-react";
import LoadingSkeleton from "../features/orders/components/LoadingSkeleton";
import ErrorState from "../features/orders/components/ErrorState";
import OrderSummaryCard from "../features/orders/components/OrderSummaryCard";
import TrackingCard from "../features/orders/components/TrackingCard";
import OrderItemsList from "../features/orders/components/OrderItemsList";
import AddressAndHelp from "../features/orders/components/AddressAndHelp";
import MobileActionBar from "../features/orders/components/MobileActionBar";
import getTrackingSteps from "../features/orders/components/getTrackingSteps";
import CartSummary from "../features/cart/components/CartSummary";
import AddressCard from "../components/cards/AddressCard";

// ─── MAIN PAGE ───
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Use React Query for data fetching
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Memoize tracking steps to prevent unnecessary recalculations
  const trackingSteps = useMemo(() => getTrackingSteps(order), [order]);
  const latestStep = useMemo(
    () =>
      trackingSteps
        .slice()
        .reverse()
        .find((s) => s.completed) || trackingSteps[0],
    [trackingSteps],
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error || !order) return <ErrorState navigate={navigate} />;

  const pricing = order?.pricing;
  const subtotal = pricing.subtotal || 0;
  const deliveryFee = pricing.deliveryFee || 0;
  const originalTotalPrice = pricing.originalTotalPrice;
  const platformFee = pricing.platformFee;

  return (
    <div className="min-h-screen bg-[#f5f5f6] font-sans pb-24 sm:pb-12 selection:bg-[#FF3F6C] selection:text-white">
      <Header navigate={navigate} title="Order Details" />
      <main className="max-w-3xl mx-auto sm:mt-6 sm:px-4 space-y-4">
        <OrderSummaryCard order={order} />
        <TrackingCard
          order={order}
          latestStep={latestStep}
          trackingSteps={trackingSteps}
          isModalOpen={isTrackingModalOpen}
          setIsModalOpen={setIsTrackingModalOpen}
        />
        <OrderItemsList order={order} navigate={navigate} />
        <AddressCard address={order?.addressSnapshot} />
        <CartSummary
          subtotal={subtotal}
          originalTotalPrice={originalTotalPrice}
          // gstAmount={pricing.gstAmount}
          platformFee={platformFee}
          selectedItems={order.items}
          button={false}
        />
      </main>
      <MobileActionBar
        order={order}
        setIsTrackingModalOpen={setIsTrackingModalOpen}
      />
    </div>
  );
};

// ─── HEADER ───
const Header = ({ navigate, title }) => (
  <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
    <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
      <button
        onClick={() => navigate(-1)}
        className="p-1 -ml-1 hover:bg-gray-100 rounded-md transition-colors text-[#282C3F]">
        <ChevronLeft size={24} />
      </button>
      <h1 className="text-[15px] font-bold text-[#282C3F] tracking-wide uppercase">
        {title}
      </h1>
    </div>
  </header>
);

export default OrderDetailPage;
