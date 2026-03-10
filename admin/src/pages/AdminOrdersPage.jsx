import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchOrdersService,
  updateOrderStatusService,
} from "../services/firebase/adminOrderService";
// Upgraded Icons for precision
import {
  FaRotate,
  FaWhatsapp,
  FaTrashCan,
  FaEye,
  FaChevronRight,
  FaBoxOpen,
  FaTruckFast,
  FaCheckDouble,
  FaCircleExclamation,
  FaIndianRupeeSign,
  FaRegFileLines,
  FaCircleCheck,
  FaXmark,
  FaClock,
} from "react-icons/fa6";
import { BiLoaderAlt, BiFilterAlt } from "react-icons/bi";
import OrderDetailsModal from "../components/modals/OrderDetailsModal";

const STATUS_FLOW = {
  pending: {
    label: "Pending",
    color: "text-rose-600",
    bg: "bg-rose-50",
    next: "confirmed",
    btn: "Authorize Order",
    icon: <FaClock />,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bg: "bg-blue-50",
    next: "packaging",
    btn: "Start Pack",
    icon: <FaCircleCheck />,
  },
  packaging: {
    label: "Packaging",
    color: "text-amber-600",
    bg: "bg-amber-50",
    next: "shipping",
    btn: "Dispatch",
    icon: <FaBoxOpen />,
  },
  shipping: {
    label: "Shipping",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    next: "delivered",
    btn: "Complete",
    icon: <FaTruckFast />,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    next: null,
    btn: null,
    icon: <FaCheckDouble />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-slate-400",
    bg: "bg-slate-50",
    next: null,
    btn: null,
    icon: <FaXmark />,
  },
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { orders: fetched } = await fetchOrdersService();
      setOrders(fetched || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (order, nextStatus) => {
    try {
      await updateOrderStatusService(order.id, nextStatus);
      if (nextStatus === "confirmed") executeWhatsApp(order);
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)),
      );
    } catch (e) {
      alert("Registry Update Failed");
    }
  };

  const executeWhatsApp = (order) => {
    let phone = order?.userSnapshot?.phone?.replace(/\D/g, "");
    if (!phone) return;
    if (phone.length === 10) phone = "91" + phone;
    const msg = `Hi ${order?.userSnapshot?.name}, Order #${order.id.slice(-6).toUpperCase()} is CONFIRMED.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        o.userSnapshot?.name?.toLowerCase().includes(s) ||
        o.userSnapshot?.phone?.includes(s),
    );
  }, [orders, searchTerm]);

  if (loading) return <LoadingHUD />;

  return (
    <div className="min-h-screen bg-[#F4F7F9] pt-24 pb-12 px-4 md:px-8 font-sans">
      <div className="max-w-[1600px] mx-auto">
        {/* STATS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatBox label="Active Cycles" value={orders.length} color="blue" />
          <StatBox
            label="Pending"
            value={orders.filter((o) => o.status === "pending").length}
            color="rose"
          />
          <StatBox
            label="Revenue Pipeline"
            value={`₹${orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}`}
            color="emerald"
          />
          <div className="bg-white p-4 border border-slate-200 rounded-sm flex items-center justify-between shadow-sm">
            <button
              onClick={loadOrders}
              className="w-full h-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#ff356c] transition-all active:scale-95">
              <FaRotate /> Refresh Registry
            </button>
          </div>
        </div>

        {/* SEARCH BAR (Amazon Boxy Style) */}
        <div className="bg-white border border-slate-200 p-3 mb-4 rounded-sm flex items-center shadow-sm">
          <BiFilterAlt className="text-slate-300 ml-2" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, or Contact..."
            className="flex-1 px-4 py-2 text-[11px] font-bold uppercase tracking-wider outline-none text-slate-900 bg-transparent"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="bg-slate-50 px-3 py-1 text-[9px] font-black text-slate-400 uppercase border border-slate-100 rounded-sm">
            Records: {filtered.length}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Client Identification</th>
                  <th className="px-6 py-4">Status & Logistics</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => {
                  const config =
                    STATUS_FLOW[order.status] || STATUS_FLOW.pending;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-slate-900">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase flex items-center gap-1">
                          <FaRegFileLines />{" "}
                          {order.createdAt?.toDate
                            ? order.createdAt.toDate().toLocaleDateString()
                            : "Recent"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-[#ff356c] uppercase tracking-tighter">
                          {order.userSnapshot?.name}
                        </p>
                        <button
                          onClick={() =>
                            window.open(
                              `https://wa.me/${order.userSnapshot?.phone?.replace(/\D/g, "")}`,
                              "_blank",
                            )
                          }
                          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-emerald-500 transition-colors mt-1">
                          <FaWhatsapp /> {order.userSnapshot?.phone}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm border text-[9px] font-black uppercase tracking-widest ${config.color} ${config.bg} border-current/20`}>
                          {config.icon} {config.label}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-950 text-xs">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {config.next && (
                            <button
                              onClick={() => handleAction(order, config.next)}
                              className="px-4 py-2 bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#ff356c] transition-all active:scale-95 shadow-sm rounded-sm">
                              {config.btn}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-slate-300 hover:text-indigo-600 transition-colors active:scale-90">
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(order, "cancelled")}
                            className="p-2 text-slate-300 hover:text-rose-600 transition-colors active:scale-90">
                            <FaTrashCan size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          handleAction={handleAction}
          STATUS_FLOW={STATUS_FLOW}
        />
      )}
    </div>
  );
};

/* --- UTILITY COMPONENTS --- */

const StatBox = ({ label, value, color }) => {
  const colors = {
    blue: "border-l-blue-500",
    rose: "border-l-rose-500",
    emerald: "border-l-emerald-500",
  };
  return (
    <div
      className={`bg-white p-4 border border-slate-200 border-l-4 ${colors[color]} rounded-sm shadow-sm`}>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-xl font-black text-slate-950">{value}</p>
    </div>
  );
};

const LoadingHUD = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-20">
    <BiLoaderAlt className="animate-spin text-slate-200 mb-6" size={50} />
    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 animate-pulse">
      Scanning Logistics Registry
    </p>
  </div>
);

const EmptyState = () => (
  <div className="py-32 text-center">
    <FaBoxOpen size={48} className="mx-auto text-slate-100 mb-6" />
    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
      Registry Empty
    </h3>
  </div>
);

export default AdminOrdersPage;
