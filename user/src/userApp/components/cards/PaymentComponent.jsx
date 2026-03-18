import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Banknote } from "lucide-react";

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
  availableMethods = ["cod", "whatsapp"],
  onSelectPayment,
  defaultMethod = "cod",
}) => {
  const [selected, setSelected] = useState(
    // If defaultMethod isn't in available list, fall back to first available
    availableMethods.includes(defaultMethod)
      ? defaultMethod
      : availableMethods[0],
  );

  // ✅ Stable ref — callback changes in parent don't cause re-fires
  const callbackRef = useRef(onSelectPayment);
  useEffect(() => {
    callbackRef.current = onSelectPayment;
  }, [onSelectPayment]);

  // Fire once on mount so parent always knows the initial selection
  useEffect(() => {
    callbackRef.current?.(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — fire once only

  const handleSelect = (method) => {
    if (method === selected) return; // no-op if already selected
    setSelected(method);
    callbackRef.current?.(method);
  };

  const visibleMethods = availableMethods.filter((m) => METHODS[m]);
  const isSingle = visibleMethods.length === 1;

  return (
    <div className="bg-white border border-gray-100  overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className=" text-[12px] sm:text-[12px] font-bold text-gray-700 uppercase tracking-wide">
          Payment method
        </p>
      </div>

      {/* Options — always visible inline, no modal */}
      {visibleMethods.map((method, idx) => {
        const cfg = METHODS[method];
        const isSelected = selected === method;
        const isLast = idx === visibleMethods.length - 1;

        return (
          <label
            key={method}
            className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
              isSelected ? "" : "hover:bg-gray-50" // Removed bg-[#fff7fb]
            } ${!isLast ? "border-b border-gray-100" : ""}`}
            style={{ cursor: isSingle ? "default" : "pointer" }}>
            {/* Hidden radio */}
            <input
              type="radio"
              name="payment-method"
              value={method}
              checked={isSelected}
              onChange={() => !isSingle && handleSelect(method)}
              className="sr-only"
            />

            {/* Custom radio dot */}
            {!isSingle && (
              <div
                className="shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all"
                style={{
                  border: isSelected
                    ? "2px solid #f43397"
                    : "1.5px solid #d1d5db",
                }}>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-[#f43397]" />
                )}
              </div>
            )}

            {/* Icon */}
            <div
              className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{
                backgroundColor: cfg.iconBg,
                color: cfg.iconColor,
              }}>
              {cfg.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-gray-900">
                  {cfg.label}
                </span>
                {cfg.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700 uppercase tracking-wide">
                    {cfg.badge}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {cfg.description}
              </p>
            </div>

            {/* Selected badge */}
            {isSelected && (
              <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-[#f43397] text-[#c0005e]">
                Selected
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
};

// ✅ Dual export — works as both PaymentSelector and PaymentComponent
export { PaymentSelector };
export default PaymentSelector;
export const PaymentComponent = PaymentSelector;
