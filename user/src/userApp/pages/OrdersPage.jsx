import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../features/auth/context/UserContext";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  Search,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Calendar,
  ChevronRight,
  XCircle,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' (Active/Delivered) vs 'cancelled'

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) {
      setLoading(false);
      return;
    }
    const fetchManifest = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(30),
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchManifest();
  }, [user?.uid, isLoggedIn]);

  // Logic to separate "Cancelled" from "Active/Delivered"
  const processedOrders = useMemo(() => {
    const main = orders.filter((o) => o.orderStatus !== "cancelled");
    const cancelled = orders.filter((o) => o.orderStatus === "cancelled");
    return { main, cancelled };
  }, [orders]);

  if (!isLoggedIn) return <AuthRedirect navigate={navigate} />;

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      {/* 1. MYNTRA-STYLE STICKY HEADER */}
      <nav className="sticky top-0 z-60 bg-white border-b border-slate-50 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={20} className="text-slate-950" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
            {activeTab === "all" ? "Orders" : "Voided Manifests"}
          </span>
        </div>

        <button
          onClick={() =>
            setActiveTab(activeTab === "all" ? "cancelled" : "all")
          }
          className="text-[9px] font-black text-[#ff356c] uppercase tracking-widest border border-[#ff356c]/20 px-3 py-1.5 rounded-sm active:bg-[#ff356c] active:text-white transition-all">
          {activeTab === "all"
            ? `Cancelled (${processedOrders.cancelled.length})`
            : "View Active"}
        </button>
      </nav>

      <main className="px-5 py-8 space-y-8">
        {/* 2. DYNAMIC TITLE */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-slate-950 leading-none">
            {activeTab === "all" ? "Your " : "Voided "}
            <span className="italic font-serif text-[#ff356c]">
              {activeTab === "all" ? "Acquisitions." : "Orders."}
            </span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
            {activeTab === "all"
              ? "Registry of current activity"
              : "Historical cancellations"}
          </p>
        </div>

        {/* 3. ORDER FEED */}
        <div className="space-y-10">
          {loading ? (
            <OrdersSkeleton />
          ) : (activeTab === "all"
              ? processedOrders.main
              : processedOrders.cancelled
            ).length === 0 ? (
            <EmptyState
              navigate={navigate}
              isCancelled={activeTab === "cancelled"}
            />
          ) : (
            (activeTab === "all"
              ? processedOrders.main
              : processedOrders.cancelled
            ).map((order) => (
              <MobileOrderCard
                key={order.id}
                order={order}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

/* =========================================================================
   COMPONENT: MOBILE ORDER CARD (Pure Myntra Elite)
   ========================================================================= */
const MobileOrderCard = ({ order, navigate }) => {
  const isDelivered = order.orderStatus === "delivered";
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <div
      className={`group animate-in fade-in slide-in-from-bottom-4 duration-500 ${isCancelled ? "grayscale" : ""}`}>
      {/* Status HUD Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {!isCancelled ? (
            <div
              className={`w-1.5 h-1.5 rounded-full ${isDelivered ? "bg-emerald-500" : "bg-[#ff356c] animate-pulse"}`}
            />
          ) : (
            <XCircle size={12} className="text-slate-400" />
          )}
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${isCancelled ? "text-slate-400" : "text-slate-950"}`}>
            {isCancelled
              ? "Voided Protocol"
              : isDelivered
                ? "Delivered"
                : "In Logistics"}
          </span>
        </div>
        <span className="text-[9px] font-mono text-slate-300 uppercase tracking-tighter">
          #{order.id.slice(0, 8)}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 items-center">
        {/* Product Visual */}
        <div
          onClick={() => navigate(`/account/orders/${order.id}`)}
          className="relative w-24 h-32 bg-slate-50 border border-slate-50 overflow-hidden shrink-0">
          <img
            src={order.items?.[0]?.image}
            className="w-full h-full object-cover grayscale-[0.2]"
            alt="Product"
          />
          {order.items?.length > 1 && (
            <div className="absolute bottom-0 right-0 bg-white/90 px-2 py-1 text-[8px] font-black uppercase tracking-tighter border-tl border-slate-100">
              +{order.items.length - 1} More
            </div>
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 space-y-2">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-950 uppercase tracking-tight line-clamp-2 leading-tight">
              {order.items?.[0]?.name}
            </h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Size: {order.items?.[0]?.selectedSize} // Qty:{" "}
              {order.items?.[0]?.quantity}
            </p>
          </div>
          <p className="text-base font-light text-slate-950 italic font-serif">
            ₹{order.totalAmount?.toLocaleString()}
          </p>

          <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
            <Calendar size={10} /> Feb 18, 2026
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() =>
            navigate(
              isCancelled
                ? `/product/${order.items?.[0]?.slug}`
                : `/user/orders/${order.id}`,
            )
          }
          className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-[0.97] ${
            isCancelled
              ? "border border-slate-200 text-slate-400"
              : "bg-slate-950 text-white shadow-xl shadow-slate-100"
          }`}>
          {isCancelled ? "Re-Acquire" : "Track Manifest"}
          {isCancelled ? <RefreshCw size={12} /> : <MapPin size={12} />}
        </button>

        {!isCancelled && (
          <button className="px-5 border border-slate-100 flex items-center justify-center active:bg-slate-50 transition-colors">
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        )}
      </div>
    </div>
  );
};

/* SKELETON & HELPERS */
const OrdersSkeleton = () => (
  <div className="space-y-12">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-50 w-1/3" />
        <div className="flex gap-6">
          <div className="w-24 h-32 bg-slate-50 rounded-sm" />
          <div className="flex-1 space-y-3 py-4">
            <div className="h-4 bg-slate-50 w-full" />
            <div className="h-4 bg-slate-50 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ navigate, isCancelled }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-10 animate-in fade-in">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
      <ShoppingBag size={24} className="text-slate-200" />
    </div>
    <h2 className="text-lg font-bold text-slate-950 uppercase tracking-tighter">
      {isCancelled ? "No Voids" : "Registry Empty"}
    </h2>
    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 mb-8 leading-loose">
      {isCancelled
        ? "You have no cancelled orders."
        : "Begin your first acquisition to populate this manifest."}
    </p>
    <button
      onClick={() => navigate("/")}
      className="w-full py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.4em]">
      Explore Collection
    </button>
  </div>
);

const AuthRedirect = ({ navigate }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-white">
    <h2 className="text-3xl font-bold tracking-tighter mb-4 text-slate-950">
      Identity <br />
      <span className="italic font-serif text-[#ff356c]">Required.</span>
    </h2>
    <button
      onClick={() => navigate("/auth/login")}
      className="w-full py-5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.5em]">
      Authorize Session
    </button>
  </div>
);

export default OrdersPage;
