import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../../context/TaruvedaCartContext";
import { useAuth } from "../../auth/context/UserContext";

const BASE_URL = "/taruveda-organic-shampoo-oil";

export default function TaruVedaCartPage() {
  const navigate = useNavigate();
  const { cart, updateCartQty, getCartItems, totalItems } = useCart();
  const { isLoggedIn } = useAuth();

  const cartItems = getCartItems();
  console.log(cartItems);
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const handleProceed = () => {
    if (cartItems.length === 0) return;

    if (isLoggedIn) {
      // 1. User Logged In -> Go to Checkout Form
      navigate("/taruveda-organic-shampoo-oil/checkout");
    } else {
      // 2. User Not Logged In -> Go to Login (pass 'from' state to return later)
      navigate("/account/login", { state: { from: "/checkout" } });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C3E30] font-sans pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200 px-4 py-4 flex items-center gap-4 z-20 shadow-sm">
        <button
          onClick={() => navigate(BASE_URL)}
          className="p-2 -ml-2 rounded-full hover:bg-stone-200 transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold">
          Your Bag ({totalItems})
        </h1>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <ShoppingBag className="w-16 h-16 text-stone-300 mb-4" />
            <p className="text-stone-500">Your bag is empty.</p>
            <button
              onClick={() => navigate(BASE_URL)}
              className="mt-6 font-bold underline">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-2xl border border-stone-100 flex gap-4 shadow-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-stone-100"
                />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="font-bold">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-stone-500">₹{item.price} each</p>
                    <div className="flex items-center bg-stone-50 rounded-lg h-8">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="px-3 hover:bg-stone-200 rounded-l-lg">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="px-3 hover:bg-stone-200 rounded-r-lg">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-lg z-30">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-stone-500 text-sm">Total Amount</span>
              <span className="text-2xl font-serif font-bold">
                ₹{totalAmount}
              </span>
            </div>
            <button
              onClick={handleProceed}
              className="w-full bg-[#2C3E30] text-white py-4 rounded-xl font-bold text-lg shadow-xl active:scale-95 transition-transform">
              Proceed to Checkout
            </button>
            <p className="text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Secure Checkout
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
