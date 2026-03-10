import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Hash,
  Smartphone,
  ChevronDown,
  FileText,
  Download,
} from "lucide-react";

const STATUS_FLOW = {
  pending: {
    label: "Pending",
    icon: Clock,
    desc: "Awaiting system handshake.",
    step: 1,
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    desc: "Manifest authorized.",
    step: 2,
  },
  packaging: {
    label: "Packaging",
    icon: Package,
    desc: "Editorial wrapping.",
    step: 3,
  },
  shipping: {
    label: "Shipping",
    icon: Truck,
    desc: "In transit to coordinates.",
    step: 4,
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    desc: "Acquisition complete.",
    step: 5,
  },
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullStatus, setShowFullStatus] = useState(false);
  console.log(order);
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const docSnap = await getDoc(doc(db, "orders", orderId));
        if (docSnap.exists()) setOrder({ id: docSnap.id, ...docSnap.data() });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [orderId]);

  if (loading) return <LoadingManifest />;
  if (!order) return <VoidManifest navigate={navigate} />;

  const currentStatus =
    STATUS_FLOW[order.orderStatus?.toLowerCase()] || STATUS_FLOW.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-[#FBFBFA] font-sans selection:bg-[#ff356c] selection:text-white pb-20">
      {/* 1. ARCHITECTURAL NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-50 px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 transition-all">
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="hidden sm:inline">Back to Archive</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">
            Order Manifest
          </span>
          <div className="w-1 h-1 rounded-full bg-[#ff356c] mt-1" />
        </div>

        <div className="flex items-center gap-4">
          <ShieldCheck size={20} className="text-[#ff356c]" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* LEFT COLUMN: STATUS & PRODUCTS (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* ORDER IDENTITY HUD */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Hash size={14} className="text-slate-300" />
                <span className="text-xs font-mono text-slate-400 tracking-tighter uppercase">
                  {order.id}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-950 leading-none">
                Order{" "}
                <span className="italic font-serif text-[#ff356c]">
                  Summary.
                </span>
              </h1>
            </div>

            {/* DYNAMIC STATUS CARD */}
            <section className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
              <button
                onClick={() => setShowFullStatus(!showFullStatus)}
                className="w-full p-6 md:p-8 text-left transition-all active:bg-slate-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200">
                      <StatusIcon
                        size={24}
                        className={
                          order.orderStatus !== "delivered"
                            ? "animate-pulse"
                            : ""
                        }
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                        Current Protocol
                      </p>
                      <h3 className="text-xl md:text-2xl font-black text-slate-950 uppercase tracking-tight italic font-serif">
                        {currentStatus.label}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-300 transition-transform duration-700 ${showFullStatus ? "rotate-180" : ""}`}
                  />
                </div>

                {/* SLURP PROGRESS BAR */}
                <div className="h-2px bg-slate-50 w-full relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#ff356c] transition-all duration-1000 ease-in-out"
                    style={{ width: `${(currentStatus.step / 5) * 100}%` }}
                  />
                </div>

                {/* EXPANDABLE LOGISTICS FEED */}
                <div
                  className={`transition-all duration-700 ease-in-out overflow-hidden ${showFullStatus ? "max-h-[500px] mt-10 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="space-y-8 pl-2">
                    {Object.keys(STATUS_FLOW).map((key) => {
                      const step = STATUS_FLOW[key];
                      const isPast = step.step < currentStatus.step;
                      const isCurrent = step.step === currentStatus.step;
                      return (
                        <div key={key} className="flex gap-6 relative">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-2 h-2 rounded-full z-10 ${isPast ? "bg-slate-900" : isCurrent ? "bg-[#ff356c] ring-4 ring-pink-50" : "bg-slate-100"}`}
                            />
                            {step.step < 5 && (
                              <div
                                className={`w-1px h-10 mt-1 ${isPast ? "bg-slate-900" : "bg-slate-100"}`}
                              />
                            )}
                          </div>
                          <div className="-mt-1.5">
                            <p
                              className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? "text-slate-950" : "text-slate-300"}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xs">
                                {step.desc}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </button>
            </section>

            {/* PRODUCT LISTING GALLERY */}
            <section className="space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300">
                Acquired Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 border border-slate-100 flex gap-6 hover:border-[#ff356c] transition-colors group">
                    <div className="w-24 h-32 bg-slate-50 shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex flex-col justify-center space-y-2">
                      <h4 className="text-sm font-bold text-slate-950 uppercase tracking-tight line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        S: {item.selectedSize} // Q: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-[#ff356c] font-serif italic">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: FINANCIALS & COORDINATES (4 Cols) */}
          <aside className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-32">
            {/* SHIPMENT COORDINATES */}
            <div className="bg-white border border-slate-100 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#ff356c]" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950">
                  Shipment Coordinates
                </h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 uppercase">
                  {order.deliveryAddress?.name}
                </p>
                <p className="text-xs text-slate-500 leading-loose uppercase tracking-tighter">
                  {order.deliveryAddress?.line1}, {order.deliveryAddress?.city}{" "}
                  <br />
                  {order.deliveryAddress?.state} —{" "}
                  {order.deliveryAddress?.pincode}
                </p>
                <div className="pt-4 flex items-center gap-2">
                  <Smartphone size={12} className="text-slate-300" />
                  <span className="text-[11px] font-black text-slate-950">
                    {order.deliveryAddress?.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* FINANCIAL LEDGER */}
            <div className="bg-slate-950 text-white p-8 space-y-6 shadow-2xl shadow-slate-200">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                Financial Ledger
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Subtotal Manifest</span>
                  <span>₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-400 border-b border-white/5 pb-4">
                  <span>Logistics Protocol</span>
                  <span className="text-[#ff356c]">Complimentary</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                    Net Value
                  </span>
                  <span className="text-3xl font-bold tracking-tighter font-serif">
                    ₹{order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <button className="w-full py-4 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#ff356c] hover:text-white transition-all flex items-center justify-center gap-3">
                <Download size={14} /> Download Receipt
              </button>
            </div>

            <p className="text-[9px] text-center text-slate-300 uppercase tracking-widest leading-loose">
              Acquisition authorized via Mnmukt Secure Tunnel. <br /> All data
              encrypted.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
};

/* --- LOADING & ERROR PROTOCOLS --- */

const LoadingManifest = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
    <div className="w-1px h-20 bg-slate-100 animate-pulse" />
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 animate-pulse italic font-serif">
      Syncing Registry
    </span>
  </div>
);

const VoidManifest = ({ navigate }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <h2 className="text-6xl font-bold tracking-tighter text-[#ff356c] italic font-serif mb-6">
      Void.
    </h2>
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">
      Acquisition data is missing from the registry.
    </p>
    <button
      onClick={() => navigate("/")}
      className="px-12 py-5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.5em]">
      Return to Index
    </button>
  </div>
);

export default OrderDetailPage;
