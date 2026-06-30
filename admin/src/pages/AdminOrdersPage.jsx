import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchOrdersService,
  updateOrderStatusService,
  deleteOrderService,
} from "../services/firebase/adminOrderService";
import {
  FaArrowRotateRight,
  FaWhatsapp,
  FaBoxOpen,
  FaTruckFast,
  FaCheck,
  FaXmark,
  FaEllipsisVertical,
  FaChevronLeft,
  FaChevronRight,
  FaLocationDot,
  FaCreditCard,
} from "react-icons/fa6";
import { BiSearch, BiLoaderAlt } from "react-icons/bi";

// Enterprise SaaS Status Configuration (Shopify/Shiprocket style)
const STATUS_FLOW = {
  pending: {
    label: "Unfulfilled",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    dot: "bg-yellow-500",
    next: "confirmed",
    btn: "Accept Order",
    btnClass: "bg-[#1a1a1a] hover:bg-[#333333] text-white shadow-sm",
  },
  confirmed: {
    label: "To Pack",
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
    next: "packaging",
    btn: "Mark as Packed",
    btnClass: "bg-[#1a1a1a] hover:bg-[#333333] text-white shadow-sm",
  },
  packaging: {
    label: "Ready to Ship",
    color: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    dot: "bg-indigo-500",
    next: "shipping",
    btn: "Create Dispatch",
    btnClass: "bg-[#008060] hover:bg-[#006e52] text-white shadow-sm", // Shopify Green
  },
  shipping: {
    label: "In Transit",
    color: "bg-sky-50 text-sky-700 border border-sky-200",
    dot: "bg-sky-500",
    next: "delivered",
    btn: "Mark Delivered",
    btnClass: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
    next: null,
    btn: null,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-700 border border-gray-200",
    dot: "bg-gray-500",
    next: null,
    btn: null,
  },
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [serverCounts, setServerCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [checklist, setChecklist] = useState({});
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [courierName, setCourierName] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => setPage(1), [activeTab, debouncedSearch]);

  useEffect(() => {
    loadOrders(page, activeTab, debouncedSearch);
  }, [page, activeTab, debouncedSearch]);

  const loadOrders = async (pageNumber, tab, searchQuery) => {
    setLoading(true);
    try {
      const { orders: fetched, pagination } = await fetchOrdersService(
        pageNumber,
        15,
        tab,
        searchQuery,
      );
      const list = fetched || [];
      setOrders(list);
      setTotalPages(pagination?.pages || 1);
      setTotalOrders(pagination?.total || 0);
      if (pagination?.counts) setServerCounts(pagination.counts);

      if (list.length > 0) {
        const currentStillExists = list.find((o) => o.id === selectedOrder?.id);
        setSelectedOrder(currentStillExists || list[0]);
      } else {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (order, nextStatus) => {
    if (order.status === "packaging" && nextStatus === "shipping") {
      setDispatchOrder(order);
      setCourierName("Delhivery");
      setTrackingNumber("");
      setTrackingUrl("");
      return;
    }

    try {
      await updateOrderStatusService(order.id, nextStatus, null);
      if (nextStatus === "confirmed") executeWhatsApp(order, "confirmed");
      if (nextStatus === "delivered") executeWhatsApp(order, "delivered");
      await loadOrders(page, activeTab, debouncedSearch);
    } catch (e) {
      alert("Failed to update status: " + e.message);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchOrder) return;
    if (!trackingNumber.trim()) {
      alert("Please enter tracking number");
      return;
    }

    try {
      const dispatchData = {
        courier: courierName,
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl.trim(),
      };
      await updateOrderStatusService(
        dispatchOrder.id,
        "shipping",
        dispatchData,
      );
      executeWhatsApp(dispatchOrder, "shipping", dispatchData);
      setDispatchOrder(null);
      await loadOrders(page, activeTab, debouncedSearch);
    } catch (e) {
      alert("Failed to dispatch: " + e.message);
    }
  };

  const executeWhatsApp = (order, type, dispatchData = {}) => {
    let phone = order?.userSnapshot?.phone?.replace(/\D/g, "");
    if (!phone) return;
    if (phone.length === 10) phone = "91" + phone;

    let msg = "";
    const orderNum = order.id.slice(-6).toUpperCase();

    if (type === "confirmed") {
      msg = `Hi ${order?.userSnapshot?.name}, your order #${orderNum} is confirmed and is currently being packed.`;
    } else if (type === "shipping") {
      const courier = dispatchData.courier || "our logistics partner";
      const trackingId = dispatchData.trackingNumber
        ? ` (AWB: ${dispatchData.trackingNumber})`
        : "";
      msg = `Hi ${order?.userSnapshot?.name}, order #${orderNum} has been shipped via ${courier}${trackingId}.`;
    } else if (type === "delivered") {
      msg = `Hi ${order?.userSnapshot?.name}, order #${orderNum} is delivered. Thank you!`;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this record permanently?")) return;
    try {
      await deleteOrderService(orderId);
      await loadOrders(page, activeTab, debouncedSearch);
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const handleCheckItem = (orderId, idx) => {
    setChecklist((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [idx]: !prev[orderId]?.[idx] },
    }));
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans text-[#202223] flex flex-col selection:bg-blue-100">
      {/* ENTERPRISE APP HEADER */}
      <header className="bg-white border-b border-[#e1e3e5] px-6 py-3 flex justify-between items-center z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#202223] tracking-tight">
              mnmukt Commerce
            </h1>
            <p className="text-[11px] text-[#6d7175]">Fulfillment Network</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-80 hidden md:block">
            <BiSearch
              className="absolute left-3 top-2 text-[#6d7175]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by order ID, customer..."
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-[#c9cccf] rounded-lg bg-[#f4f6f8] hover:bg-white focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => loadOrders(page, activeTab, debouncedSearch)}
            className="p-2 text-[#6d7175] hover:bg-[#f4f6f8] rounded-md border border-transparent hover:border-[#e1e3e5] transition-all"
            title="Refresh Orders">
            <FaArrowRotateRight size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col p-4 md:p-6 gap-6 h-[calc(100vh-60px)]">
        {/* PAGE HEADER */}
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-[#202223]">Orders</h2>
        </div>

        {/* MAIN WORKSPACE GRID */}
        <div className="flex-1 bg-white border border-[#e1e3e5] rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* TABS ROW */}
          <div className="flex items-center border-b border-[#e1e3e5] overflow-x-auto scrollbar-hide px-2">
            <Tab
              id="all"
              label="All orders"
              count={serverCounts.all}
              active={activeTab}
              onClick={setActiveTab}
            />
            <Tab
              id="pending"
              label="Unfulfilled"
              count={serverCounts.pending}
              active={activeTab}
              onClick={setActiveTab}
            />
            <Tab
              id="confirmed"
              label="To Pack"
              count={serverCounts.confirmed}
              active={activeTab}
              onClick={setActiveTab}
            />
            <Tab
              id="packaging"
              label="Ready to Ship"
              count={serverCounts.processing}
              active={activeTab}
              onClick={setActiveTab}
            />
            <Tab
              id="shipping"
              label="In Transit"
              count={serverCounts.shipped}
              active={activeTab}
              onClick={setActiveTab}
            />
            <Tab
              id="delivered"
              label="Delivered"
              count={serverCounts.delivered}
              active={activeTab}
              onClick={setActiveTab}
            />
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: ORDER LIST */}
            <div className="w-full md:w-[320px] lg:w-[380px] border-r border-[#e1e3e5] flex flex-col bg-[#f9fafb]">
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-[#6d7175]">
                    <BiLoaderAlt className="animate-spin mb-3" size={24} />
                    <p className="text-sm">Fetching orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-20 text-center px-4 text-[#6d7175]">
                    <p className="text-sm">No orders found in this view.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e1e3e5]">
                    {orders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      const config =
                        STATUS_FLOW[order.status] || STATUS_FLOW.pending;
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-white relative"
                              : "hover:bg-gray-50"
                          }`}>
                          {isSelected && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600 rounded-r-full" />
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-[#202223]">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-xs text-[#6d7175]">
                              {order.createdAt?.toDate
                                ? order.createdAt
                                    .toDate()
                                    .toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })
                                : "New"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-[#202223] truncate pr-2">
                              {order.userSnapshot?.name}
                            </span>
                            <span className="text-sm font-semibold text-[#202223]">
                              ₹{order.totalAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${config.color}`}>
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
                              />
                              {config.label}
                            </span>
                            <span className="text-[11px] text-[#6d7175] border border-[#e1e3e5] px-1.5 py-0.5 rounded bg-white">
                              {order.items?.length || 0} item
                              {order.items?.length !== 1 && "s"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LIST PAGINATION */}
              {!loading && totalPages > 1 && (
                <div className="p-3 border-t border-[#e1e3e5] bg-white flex justify-between items-center">
                  <span className="text-xs text-[#6d7175]">
                    {totalOrders} records
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-1 border border-[#c9cccf] bg-white rounded shadow-sm text-[#202223] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      <FaChevronLeft size={12} />
                    </button>
                    <span className="text-xs font-medium text-[#202223] px-2">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className="p-1 border border-[#c9cccf] bg-white rounded shadow-sm text-[#202223] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: DETAILS PANEL */}
            <div className="hidden md:flex flex-1 flex-col h-full bg-[#f4f6f8] overflow-y-auto relative scrollbar-thin">
              {selectedOrder ? (
                <div className="p-6 max-w-4xl mx-auto w-full space-y-6 pb-24">
                  {/* Detail Header & Primary Actions */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold text-[#202223]">
                          #{selectedOrder.id.toUpperCase()}
                        </h2>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_FLOW[selectedOrder.status]?.color}`}>
                          <span
                            className={`w-2 h-2 rounded-full ${STATUS_FLOW[selectedOrder.status]?.dot}`}
                          />
                          {STATUS_FLOW[selectedOrder.status]?.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#6d7175]">
                        {selectedOrder.createdAt?.toDate
                          ? selectedOrder.createdAt.toDate().toLocaleString()
                          : ""}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDelete(selectedOrder.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-[#c9cccf] rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                        Delete
                      </button>
                      {STATUS_FLOW[selectedOrder.status]?.next && (
                        <button
                          onClick={() =>
                            handleAction(
                              selectedOrder,
                              STATUS_FLOW[selectedOrder.status].next,
                            )
                          }
                          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${STATUS_FLOW[selectedOrder.status].btnClass}`}>
                          {STATUS_FLOW[selectedOrder.status].btn}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Top Row Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Items) takes 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Products Card */}
                      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e5] overflow-hidden">
                        <div className="p-4 border-b border-[#e1e3e5] flex justify-between items-center bg-[#f9fafb]">
                          <h3 className="text-sm font-semibold text-[#202223] flex items-center gap-2">
                            <FaBoxOpen className="text-[#6d7175]" /> Unfulfilled
                            Items
                          </h3>
                        </div>
                        <div className="p-0">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-[#f9fafb] text-[#6d7175] text-xs uppercase border-b border-[#e1e3e5]">
                              <tr>
                                <th className="px-4 py-3 font-medium rounded-tl-lg">
                                  Pack
                                </th>
                                <th className="px-4 py-3 font-medium">
                                  Product
                                </th>
                                <th className="px-4 py-3 font-medium text-right">
                                  Price
                                </th>
                                <th className="px-4 py-3 font-medium text-right">
                                  Qty
                                </th>
                                <th className="px-4 py-3 font-medium text-right">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e1e3e5]">
                              {selectedOrder.items?.map((item, idx) => {
                                const isChecked =
                                  !!checklist[selectedOrder.id]?.[idx];
                                return (
                                  <tr
                                    key={idx}
                                    className={`hover:bg-gray-50 transition-colors ${isChecked ? "opacity-60" : ""}`}>
                                    <td className="px-4 py-3 w-10">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                          handleCheckItem(selectedOrder.id, idx)
                                        }
                                        className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded border border-[#e1e3e5] bg-white overflow-hidden flex-shrink-0">
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div>
                                          <p
                                            className={`font-medium text-[#202223] ${isChecked ? "line-through text-[#6d7175]" : ""}`}>
                                            {item.name}
                                          </p>
                                          <p className="text-xs text-[#6d7175] mt-0.5">
                                            SKU: {item.sku || "—"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-[#6d7175]">
                                      ₹{item.price.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-right text-[#202223] font-medium">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-right text-[#202223] font-medium">
                                      ₹
                                      {(
                                        item.price * item.quantity
                                      ).toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-4 border-t border-[#e1e3e5] bg-[#f9fafb] flex justify-end">
                          <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between text-[#6d7175]">
                              <span>Subtotal</span>
                              <span>
                                ₹{selectedOrder.totalAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-[#6d7175]">
                              <span>Shipping</span>
                              <span>₹0</span>
                            </div>
                            <div className="flex justify-between font-semibold text-[#202223] pt-2 border-t border-[#e1e3e5]">
                              <span>Total</span>
                              <span>
                                ₹{selectedOrder.totalAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Card */}
                      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e5] overflow-hidden">
                        <div className="p-4 border-b border-[#e1e3e5] flex justify-between items-center bg-[#f9fafb]">
                          <h3 className="text-sm font-semibold text-[#202223] flex items-center gap-2">
                            <FaCreditCard className="text-[#6d7175]" /> Payment
                            Details
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ${selectedOrder.paymentDetails?.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {selectedOrder.paymentDetails?.status === "paid"
                              ? "Paid"
                              : "Pending"}
                          </span>
                        </div>
                        <div className="p-4 flex gap-8 text-sm">
                          <div>
                            <p className="text-[#6d7175] mb-1">
                              Gateway Method
                            </p>
                            <p className="font-medium text-[#202223]">
                              {selectedOrder.paymentDetails?.method === "cod"
                                ? "Cash on Delivery (COD)"
                                : "Online Pre-paid"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Customer & Shipping) takes 1/3 width */}
                    <div className="space-y-6">
                      {/* Customer Card */}
                      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e5] p-5">
                        <h3 className="text-sm font-semibold text-[#202223] mb-4">
                          Customer
                        </h3>
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-[#202223] font-medium">
                              {selectedOrder.userSnapshot?.name}
                            </p>
                            <p className="text-blue-600 mt-1 cursor-pointer hover:underline">
                              {selectedOrder.userSnapshot?.phone}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              executeWhatsApp(selectedOrder, "confirmed")
                            }
                            className="w-full py-2 bg-[#f4f6f8] hover:bg-[#e1e3e5] text-[#202223] border border-[#c9cccf] rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                            <FaWhatsapp className="text-green-600" size={16} />{" "}
                            Contact Customer
                          </button>

                          <div className="pt-4 border-t border-[#e1e3e5]">
                            <h4 className="text-xs font-semibold text-[#6d7175] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <FaLocationDot /> Shipping Address
                            </h4>
                            <p className="text-[#202223] leading-relaxed">
                              {selectedOrder.deliveryAddress?.name ||
                                selectedOrder.userSnapshot?.name}{" "}
                              <br />
                              {selectedOrder.deliveryAddress?.line1} <br />
                              {selectedOrder.deliveryAddress?.city},{" "}
                              {selectedOrder.deliveryAddress?.state} <br />
                              {selectedOrder.deliveryAddress?.pincode}
                            </p>
                            {selectedOrder.deliveryAddress?.phone && (
                              <p className="text-[#6d7175] mt-2">
                                Phone: {selectedOrder.deliveryAddress?.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipment Tracking Card */}
                      <div className="bg-white rounded-xl shadow-sm border border-[#e1e3e5] p-5">
                        <h3 className="text-sm font-semibold text-[#202223] mb-4 flex items-center gap-2">
                          <FaTruckFast className="text-[#6d7175]" /> Tracking
                          Info
                        </h3>
                        {selectedOrder.raw?.shipments?.[0] ? (
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-[#6d7175] text-xs">
                                Courier Partner
                              </p>
                              <p className="font-medium text-[#202223]">
                                {selectedOrder.raw.shipments[0].courier}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#6d7175] text-xs">
                                Tracking Number
                              </p>
                              <p className="font-mono text-[#202223]">
                                {selectedOrder.raw.shipments[0].trackingNumber}
                              </p>
                            </div>
                            {selectedOrder.raw.shipments[0].trackingUrl && (
                              <a
                                href={
                                  selectedOrder.raw.shipments[0].trackingUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="block text-center mt-4 py-2 bg-white hover:bg-gray-50 border border-[#c9cccf] text-[#202223] font-medium rounded-lg text-sm transition-colors shadow-sm">
                                View Tracking Status
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-[#6d7175] text-sm italic">
                            No dispatch records attached yet. Process this order
                            to generate an AWB.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#6d7175]">
                  <FaBoxOpen size={40} className="text-[#c9cccf] mb-4" />
                  <p className="text-base font-medium text-[#202223]">
                    Select an order to view details
                  </p>
                  <p className="text-sm mt-1">
                    Order details and fulfillment actions will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COURIER DISPATCH MODAL (Polaris Style) */}
      {dispatchOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-[#e1e3e5] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e1e3e5] flex justify-between items-center bg-[#f9fafb]">
              <h3 className="text-base font-semibold text-[#202223]">
                Fulfill Order #{dispatchOrder.id.toUpperCase()}
              </h3>
              <button
                onClick={() => setDispatchOrder(null)}
                className="text-[#6d7175] hover:text-[#202223]">
                <FaXmark size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-[#202223] font-medium mb-1.5">
                  Shipping Carrier
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9cccf] rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="Delhivery">Delhivery</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Shiprocket">Shiprocket (Auto)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#202223] font-medium mb-1.5">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter AWB number"
                  className="w-full px-3 py-2 border border-[#c9cccf] rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[#202223] font-medium mb-1.5">
                  Tracking URL{" "}
                  <span className="text-[#6d7175] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-[#c9cccf] rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#e1e3e5] bg-[#f9fafb] flex justify-end gap-3">
              <button
                onClick={() => setDispatchOrder(null)}
                className="px-4 py-2 bg-white border border-[#c9cccf] rounded-lg text-sm font-medium text-[#202223] hover:bg-gray-50 shadow-sm">
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                disabled={!trackingNumber.trim()}
                className="px-4 py-2 bg-[#008060] text-white rounded-lg text-sm font-medium hover:bg-[#006e52] disabled:opacity-50 shadow-sm">
                Fulfill Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- TAB COMPONENT --- */
const Tab = ({ id, label, count, active, onClick }) => {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
        isActive
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-[#6d7175] hover:text-[#202223] hover:bg-gray-50"
      }`}>
      {label}
      <span
        className={`px-2 py-0.5 rounded-full text-xs transition-colors ${isActive ? "bg-blue-100 text-blue-700 font-semibold" : "bg-[#e1e3e5] text-[#202223]"}`}>
        {count || 0}
      </span>
    </button>
  );
};

export default AdminOrdersPage;
