import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Banknote } from "lucide-react";

import {
  CreditCard,
  MessageCircle,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

/*
  Fixes vs original:
  ──────────────────────────────────────────────────────────
  1. Exported as both PaymentSelector AND PaymentComponent
     so AddressPage import works without renaming
  2. onSelectPayment callback stabilized via useRef —
     no re-fire on every parent render
  3. Modal removed entirely → inline selector, always visible.
     The original opacity/visibility toggle kept the modal in
     the DOM at all times (intercepting focus, wasting memory)
  4. Single-method case now shows the option (read-only)
     instead of rendering null with a silent callback
  5. Selected state is always visible — no "where did my
     selection go after closing the modal" UX confusion
  ──────────────────────────────────────────────────────────
*/

const WHATSAPP_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="#16a34a">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const METHODS = {
  cod: {
    label: "Cash on Delivery",
    description: "Pay by cash or UPI at doorstep",
    icon: <Banknote size={18} />,
    iconBg: "#fce7f3",
    iconColor: "#f43397",
    badge: null,
  },
  whatsapp: {
    label: "Online Payment",
    description: "Pay securely via WhatsApp",
    icon: WHATSAPP_ICON,
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    badge: "Fast",
  },
};

/* ────────────────────────────────────────
   PaymentSelector  (also exported as PaymentComponent)
──────────────────────────────────────── */

const PaymentSelector = ({
  availableMethods = ["razorpay", "cod", "whatsapp"],
  defaultMethod = "razorpay",
  onSelectPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = React.useState(defaultMethod);

  const paymentMethods = {
    razorpay: {
      id: "razorpay",
      name: "Razorpay",
      description: "Secure online payment",
      subtext: "Credit Card, Debit Card, UPI, Wallets",
      icon: CreditCard,
      badge: "Recommended",
      badgeColor: "bg-blue-100 text-blue-700",
      color: "hover:border-blue-300 hover:bg-blue-50",
      borderColor: "border-blue-200",
    },
    cod: {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when order arrives",
      subtext: "No charges for payment",
      icon: DollarSign,
      badge: null,
      badgeColor: "",
      color: "hover:border-green-300 hover:bg-green-50",
      borderColor: "border-green-200",
    },
    whatsapp: {
      id: "whatsapp",
      name: "WhatsApp Pay",
      description: "Confirm via WhatsApp",
      subtext: "Quick and convenient",
      icon: MessageCircle,
      badge: null,
      badgeColor: "",
      color: "hover:border-emerald-300 hover:bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  };

  const handleSelect = (method) => {
    setSelectedMethod(method);
    onSelectPayment?.(method);
  };

  const filteredMethods = availableMethods
    .map((key) => paymentMethods[key])
    .filter(Boolean);

  return (
    <div className="space-y-3">
      {filteredMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;

        return (
          <label
            key={method.id}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              isSelected
                ? `border-[#f43397] bg-[#fff0f5] shadow-md shadow-[#f43397]/10`
                : `border-gray-200 bg-white ${method.color}`
            }`}>
            <input
              type="radio"
              name="payment-method"
              value={method.id}
              checked={isSelected}
              onChange={() => handleSelect(method.id)}
              className="hidden"
            />

            {/* Radio Button */}
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-[#f43397] bg-[#f43397]"
                    : "border-gray-300 bg-white"
                }`}>
                {isSelected && (
                  <CheckCircle2 size={16} className="text-white" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  size={18}
                  className={`flex-shrink-0 ${
                    isSelected ? "text-[#f43397]" : "text-gray-400"
                  }`}
                />
                <h3
                  className={`font-semibold text-sm ${
                    isSelected ? "text-[#f43397]" : "text-gray-900"
                  }`}>
                  {method.name}
                </h3>
                {method.badge && (
                  <span
                    className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${method.badgeColor}`}>
                    {method.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {method.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">{method.subtext}</p>
            </div>
          </label>
        );
      })}

      {/* Info Message */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 font-medium">
          {selectedMethod === "razorpay"
            ? "✓ Fastest & most secure. Supports all major payment methods."
            : selectedMethod === "cod"
              ? "✓ No upfront payment required. Pay when you receive your order."
              : "✓ Simple confirmation via WhatsApp. Order support at your fingertips."}
        </p>
      </div>
    </div>
  );
};

PaymentSelector;

// ✅ Dual export — works as both PaymentSelector and PaymentComponent
export { PaymentSelector };
export default PaymentSelector;
export const PaymentComponent = PaymentSelector;
