// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ShieldCheck, AlertCircle } from "lucide-react";

// // Contexts
// import { useAuth } from "../../../context/AuthContext";
// import { useCart } from "../../../context/TaruvedaCartContext";

// // Services
// import {
//   placeOrder,
//   generateWhatsAppLink,
// } from "../services/taruVedaOrderService";

// // Components
// import LoginRequired from "../components/checkout/LoginRequired";
// import ShippingDetails from "../components/checkout/ShippingDetails";
// import PaymentMethod from "../../components/components/";
// import OrderSummary from "../../code/";

// export default function TaruVedaCheckoutPage() {
//   const navigate = useNavigate();
//   const { user, isLoggedIn } = useAuth();
//   const { getCartItems, totalItems } = useCart();

//   const [loading, setLoading] = useState(false);
//   const [customerNote, setCustomerNote] = useState("");
//   const [paymentType, setPaymentType] = useState("cod"); // Default to Cash on Delivery
//   const [error, setError] = useState("");

//   // Calculate Totals
//   const cartItems = getCartItems();
//   const subtotal = cartItems.reduce(
//     (acc, item) => acc + item.price * item.qty,
//     0,
//   );
//   const deliveryFee = subtotal > 499 ? 0 : 50; // Example logic: Free shipping over 500
//   const total = subtotal + deliveryFee;

//   // --- Logic: Place Order ---
//   const handlePlaceOrder = async () => {
//     setError("");

//     if (!isLoggedIn) return navigate("/account/login");
//     if (cartItems.length === 0) return setError("Your cart is empty.");

//     setLoading(true);

//     try {
//       // 1. Structure Data for Service
//       const shippingDetails = {
//         name: user.name || "Guest",
//         phone: user.phone || "N/A",
//         address: user.address?.street || "No Address Provided",
//         city: user.address?.city || "",
//         pincode: user.address?.pincode || "",
//       };

//       // 2. Call Firebase Service
//       const result = await placeOrder(
//         user,
//         cartItems,
//         shippingDetails,
//         total,
//         paymentType,
//       );

//       if (result.success) {
//         // 3. Success: Redirect to WhatsApp
//         const waLink = generateWhatsAppLink(
//           result.orderId,
//           shippingDetails,
//           cartItems,
//           total,
//         );

//         // Slight delay for UX
//         setTimeout(() => {
//           window.location.href = waLink;
//         }, 1000);
//       } else {
//         setError("Failed to place order. Please try again.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("An unexpected error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 1. Guard Clause: Not Logged In
//   if (!isLoggedIn) return <LoginRequired navigate={navigate} />;

//   return (
//     <div className="min-h-screen bg-[#FDFBF7] py-8 font-sans text-[#2C3E30]">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-serif font-bold">Checkout</h1>
//           <p className="text-stone-500">
//             Review your details and confirm your order.
//           </p>
//         </div>

//         {/* Error Banner */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
//             <AlertCircle className="w-5 h-5" /> {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* --- LEFT COLUMN: DETAILS --- */}
//           <div className="lg:col-span-2 space-y-6">
//             <ShippingDetails user={user} navigate={navigate} />

//             <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
//               <h3 className="font-bold text-sm text-stone-400 uppercase tracking-wider mb-4">
//                 Order Note (Optional)
//               </h3>
//               <textarea
//                 className="w-full bg-stone-50 p-3 rounded-xl outline-none focus:ring-1 focus:ring-green-700 resize-none text-sm"
//                 rows="2"
//                 placeholder="Any special instructions for delivery?"
//                 value={customerNote}
//                 onChange={(e) => setCustomerNote(e.target.value)}
//               />
//             </div>

//             <PaymentMethod
//               paymentType={paymentType}
//               setPaymentType={setPaymentType}
//             />
//           </div>

//           {/* --- RIGHT COLUMN: SUMMARY --- */}
//           <div className="lg:col-span-1">
//             <OrderSummary
//               cartItems={cartItems}
//               subtotal={subtotal}
//               deliveryFee={deliveryFee}
//               total={total}
//               loading={loading}
//               handlePlaceOrder={handlePlaceOrder}
//             />

//             <div className="mt-4 flex justify-center text-xs text-stone-400 gap-1">
//               <ShieldCheck className="w-4 h-4" /> Secure & Encrypted Checkout
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from "react";

const TaruVedaCheckoutPage = () => {
  return <div></div>;
};

export default TaruVedaCheckoutPage;
