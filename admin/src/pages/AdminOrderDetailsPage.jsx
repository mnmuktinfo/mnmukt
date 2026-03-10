import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  Search,
  Filter,
  ArrowRight,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  TrendingUp,
  Package,
  MoreHorizontal,
  RefreshCw,
  Copy,
  Loader2,
} from "lucide-react";

// CONSTANTS
const ITEMS_PER_PAGE = 10;

const AdminOrdersPage = () => {
  const navigate = useNavigate();

  // DATA STATE
  const [orders, setOrders] = useState([]);
  const [lastDoc, setLastDoc] = useState(null); // Cursor for pagination
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // FILTER STATE
  const [activeTab, setActiveTab] = useState("All"); // All, Processing, Shipped, Delivered, Cancelled
  const [searchId, setSearchId] = useState("");

  /* ==================================================================================
     1. FETCH ORDERS (Optimized for 1M+ Records)
     This function resets the list and fetches the first batch based on the active Tab.
  ================================================================================== */
  const fetchOrders = useCallback(
    async (isLoadMore = false) => {
      if (loading || (isLoadMore && !hasMore)) return;

      isLoadMore ? setLoadingMore(true) : setLoading(true);

      try {
        let q;
        const ordersRef = collection(db, "orders");

        // SCENARIO A: SEARCH BY EXACT ID (Fastest)
        if (searchId.trim()) {
          if (searchId.length < 5) {
            alert("Please enter a valid Order ID");
            setLoading(false);
            return;
          }
          // Direct document lookup is O(1) - Instant even with 1B records
          const docRef = doc(db, "orders", searchId.trim());
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setOrders([{ id: docSnap.id, ...docSnap.data() }]);
            setHasMore(false);
          } else {
            setOrders([]);
          }
          setLoading(false);
          return;
        }

        // SCENARIO B: FILTER BY STATUS + PAGINATION
        // Note: You MUST create Composite Indexes in Firebase Console for these queries to work.
        // E.g. Collection: orders | Fields: orderStatus (Asc) + createdAt (Desc)

        let constraints = [];

        if (activeTab !== "All") {
          constraints.push(where("orderStatus", "==", activeTab));
        }

        constraints.push(orderBy("createdAt", "desc"));

        if (isLoadMore && lastDoc) {
          constraints.push(startAfter(lastDoc));
        }

        constraints.push(limit(ITEMS_PER_PAGE));

        q = query(ordersRef, ...constraints);

        const snap = await getDocs(q);
        const newOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (isLoadMore) {
          setOrders((prev) => [...prev, ...newOrders]);
        } else {
          setOrders(newOrders);
        }

        setLastDoc(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.docs.length === ITEMS_PER_PAGE);
      } catch (err) {
        console.error("Admin Fetch Error:", err);
        // alert("Missing Index! Check console for Firebase link.");
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [activeTab, lastDoc, searchId, loading, hasMore],
  );

  // 2. EFFECT: Refetch when Tab changes
  useEffect(() => {
    setLastDoc(null); // Reset cursor
    setHasMore(true); // Reset flag
    fetchOrders(false); // Fetch page 1
    // eslint-disable-next-line
  }, [activeTab]);

  // 3. SEARCH HANDLER
  const handleSearch = (e) => {
    e.preventDefault();
    setLastDoc(null);
    fetchOrders(false);
  };

  const handleClearSearch = () => {
    setSearchId("");
    setLastDoc(null);
    // State updates are async, so we trigger effect or call fetch manually after render
    // Ideally, split search into a separate effect or just use the existing dep array logic
    window.location.reload(); // Simplest reset for admin
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans text-gray-900">
      {/* --- DASHBOARD HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Order Management
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Real-time overview of{" "}
                {activeTab === "All" ? "all" : activeTab.toLowerCase()} orders.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchOrders(false)}
                className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh Data">
                <RefreshCw size={18} />
              </button>
              <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-black transition-all">
                Export Report
              </button>
            </div>
          </div>

          {/* KPI CARDS (Mock Data for Visuals - Real data requires separate 'stats' document) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard
              label="Total Orders"
              value="1.2M"
              icon={Package}
              color="blue"
            />
            <StatCard label="Pending" value="84" icon={Clock} color="amber" />
            <StatCard
              label="Revenue (mtd)"
              value="₹4.5L"
              icon={TrendingUp}
              color="green"
            />
            <StatCard label="Returns" value="12" icon={XCircle} color="red" />
          </div>
        </div>
      </div>

      {/* --- TOOLBAR & FILTERS --- */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-6">
          {/* TABS */}
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                    ${
                      activeTab === tab
                        ? "bg-gray-100 text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }
                  `}>
                  {tab}
                </button>
              ),
            )}
          </div>

          {/* SEARCH FORM */}
          <form
            onSubmit={handleSearch}
            className="relative w-full xl:w-96 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-24 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all shadow-sm"
            />
            {searchId && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-red-500">
                CLEAR
              </button>
            )}
          </form>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Date Placed</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400">
                      <Loader2 className="animate-spin mx-auto mb-2" />
                      Loading Records...
                    </td>
                  </tr>
                )}

                {!loading && orders.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-12 text-center text-gray-400 font-medium">
                      No orders found matching this criteria.
                    </td>
                  </tr>
                )}

                {!loading &&
                  orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      navigate={navigate}
                    />
                  ))}
              </tbody>
            </table>
          </div>

          {/* LOAD MORE */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-center">
            <button
              onClick={() => fetchOrders(true)}
              disabled={loadingMore || !hasMore}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition-colors disabled:opacity-50 px-6 py-3">
              {loadingMore && <Loader2 size={14} className="animate-spin" />}
              {loadingMore
                ? "Loading more..."
                : hasMore
                  ? "Load More Orders"
                  : "End of List"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================================
   SUB-COMPONENT: ORDER ROW (Memoized for performance)
   ================================================================================== */
const OrderRow = React.memo(({ order, navigate }) => {
  // Safe Date Formatting
  const dateStr = order.createdAt?.toDate
    ? new Intl.DateTimeFormat("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(order.createdAt.toDate())
    : "Invalid Date";

  // Status Styling Helper
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered") return "bg-green-50 text-green-700 border-green-100";
    if (s === "shipped") return "bg-blue-50 text-blue-700 border-blue-100";
    if (s === "cancelled") return "bg-red-50 text-red-700 border-red-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  const copyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.id);
    // Optional: Add toast
  };

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      {/* 1. ID */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gray-900">
            #{order.id.slice(0, 8).toUpperCase()}...
          </span>
          <button
            onClick={copyId}
            className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <Copy size={12} />
          </button>
        </div>
      </td>

      {/* 2. CUSTOMER */}
      <td className="px-6 py-4">
        <div
          onClick={() => navigate(`/admin/users/${order.userId}`)}
          className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
            {order.shippingAddress?.name?.[0]?.toUpperCase() || (
              <User size={14} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {order.shippingAddress?.name || "Guest User"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              {order.userEmail || "No Email Linked"}
            </p>
          </div>
        </div>
      </td>

      {/* 3. DATE */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={14} />
          <span className="text-xs font-medium">{dateStr}</span>
        </div>
      </td>

      {/* 4. STATUS */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.orderStatus)}`}>
          <div
            className={`w-1.5 h-1.5 rounded-full ${order.orderStatus === "Processing" ? "animate-pulse bg-current" : "bg-current"}`}
          />
          {order.orderStatus || "Processing"}
        </span>
      </td>

      {/* 5. TOTAL */}
      <td className="px-6 py-4 text-right">
        <span className="text-sm font-bold text-gray-900">
          ₹{order.totalAmount?.toLocaleString()}
        </span>
      </td>

      {/* 6. ACTION */}
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => navigate(`/admin/orders/${order.id}`)}
          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-black hover:border-gray-400 transition-all shadow-sm"
          title="View Full Details">
          <ArrowRight size={16} />
        </button>
      </td>
    </tr>
  );
});

// STAT CARD
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
