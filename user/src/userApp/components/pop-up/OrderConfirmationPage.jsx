import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, CreditCard, MapPin, Package } from "lucide-react";
import { orderService } from "../../features/orders/services/orderService";

const WHATSAPP_NUMBER = "8392856993";
const STATUS_STEPS = ["placed", "confirmed", "packed", "shipped", "delivered"];
const STATUS_LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const PAYMENT_METHOD_LABELS = {
  COD: "Cash on Delivery",
  WHATSAPP: "WhatsApp Payment",
  RAZORPAY: "Online Payment",
  UPI: "UPI Payment",
};
const PAYMENT_STATUS_STYLE = {
  pending: "text-yellow-600",
  paid: "text-green-600",
  failed: "text-red-600",
};

const SectionDivider = () => <div className="h-[0.5px] w-full bg-gray-200" />;

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const [orderData, setOrderData] = useState(
    () => location.state?.orderData ?? null,
  );
  const [loading, setLoading] = useState(!location.state?.orderData);
  const fetchedRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (fetchedRef.current || orderData || !orderId) {
      setLoading(false);
      return;
    }
    fetchedRef.current = true;

    const fetchOrder = async () => {
      try {
        const details = await orderService.getOrderDetails(orderId);
        setOrderData(details);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, orderData]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  if (!orderData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    );

  const orderStatus = orderData.orderStatus ?? "placed";
  const address = orderData.addressSnapshot ?? {};
  const payment = orderData.payment ?? {};
  const pricing = orderData.pricing ?? {};
  const items = orderData.items ?? [];
  const displayOrderId =
    orderData.orderId ?? orderId?.slice(0, 10).toUpperCase();
  const totalAmount = Number(
    pricing?.totalAmount ?? orderData.totalAmount ?? 0,
  ).toLocaleString("en-IN");

  const handleConfirmOnWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello, I placed an order.\n\nOrder ID: ${displayOrderId}\nAmount: ₹${totalAmount}\n\nPlease confirm my order.`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const displayedItems = items.slice(0, 2);
  const moreItems = items.length - 2;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center font-sans py-4">
      <div className="w-full max-w-[480px] bg-white rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[#e6f8f3] p-4 flex items-center gap-3 border-b border-[#c2eee2]">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
            <img src="/confirm.svg" alt="Success" className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-[#027a61] uppercase">
              Order Successful
            </h1>
            <p className="text-xs text-[#027a61]">
              Order ID: <span className="font-semibold">{displayOrderId}</span>
            </p>
          </div>
        </div>

        {/* Order Progress */}
        {orderStatus !== "cancelled" && (
          <div className="px-3 py-2 bg-white flex justify-between items-center">
            {STATUS_STEPS.map((s, i) => (
              <div
                key={s}
                className="flex flex-col items-center relative flex-shrink-0">
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`absolute top-1 left-1/2 w-full h-[2px] ${i <= STATUS_STEPS.indexOf(orderStatus) - 1 ? "bg-[#03a685]" : "bg-gray-200"}`}
                  />
                )}
                <div
                  className={`w-3 h-3 rounded-full border-2 ${i <= STATUS_STEPS.indexOf(orderStatus) ? "bg-[#03a685] border-[#03a685]" : "bg-white border-gray-300"}`}
                />
                <span
                  className={`text-[9px] mt-1 text-center ${i <= STATUS_STEPS.indexOf(orderStatus) ? "text-gray-800" : "text-gray-400"}`}>
                  {STATUS_LABELS[s]}
                </span>
              </div>
            ))}
          </div>
        )}

        <SectionDivider />

        {/* Items List */}
        <div className="p-3 bg-white">
          {displayedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-2 p-2 border border-gray-100 rounded-sm bg-gray-50 mb-2">
              <div className="w-16 h-20 bg-gray-100 rounded-sm flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={20} className="text-gray-300 m-auto mt-6" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-[12px] text-gray-600 mt-1">
                  {item.selectedSize && (
                    <>
                      Size:{" "}
                      <span className="font-medium">{item.selectedSize}</span>
                    </>
                  )}
                  {item.selectedSize && item.selectedQuantity && (
                    <span className="mx-1">|</span>
                  )}
                  {item.selectedQuantity && (
                    <>
                      Qty:{" "}
                      <span className="font-medium">
                        {item.selectedQuantity}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-[12px] font-semibold text-gray-800 mt-1">
                  ₹{item.price?.toLocaleString("en-IN") ?? "0"}
                </p>
              </div>
            </div>
          ))}
          {moreItems > 0 && (
            <p className="text-[12px] text-[#f43397] font-semibold">
              +{moreItems} more item(s)
            </p>
          )}
        </div>

        <SectionDivider />

        {/* Address */}
        <div
          className="p-3 bg-white flex items-start justify-between cursor-pointer active:bg-gray-50"
          onClick={() => navigate("/user/orders")}>
          <div className="flex gap-2 pr-2">
            <MapPin size={18} className="text-gray-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Delivery Address
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {address.name}
              </p>
              <p className="text-[12px] text-gray-600 mt-0.5">
                {address.line1}, {address.city}, {address.state} –{" "}
                <span className="font-semibold">{address.pincode}</span>
              </p>
              <p className="text-[12px] text-gray-800 font-medium mt-0.5">
                +91 {address.phone}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 mt-1 shrink-0" />
        </div>

        <SectionDivider />

        {/* Payment */}
        <div className="p-3 bg-white">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            Payment Mode
          </p>
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-gray-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
              </p>
              <p
                className={`text-[11px] font-medium ${PAYMENT_STATUS_STYLE[payment.status] ?? "text-gray-500"}`}>
                {payment.status === "pending" && "Payment Pending"}
                {payment.status === "paid" && "Payment Completed"}
                {payment.status === "failed" && "Payment Failed"}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 left-0 w-full bg-white p-3 border-t border-gray-200 flex flex-col gap-2">
          <button
            onClick={handleConfirmOnWhatsApp}
            className="w-full bg-[#f43397] text-white py-2.5 font-bold uppercase text-[13px] rounded-md">
            Confirm on WhatsApp
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full border border-gray-300 text-gray-600 py-2 font-bold uppercase text-[13px] rounded-md">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
