import { ArrowLeft, ShieldCheck } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IMAGES } from "../../../../../assets/images";

const steps = [
  { name: "MY BAG", path: "/checkout/cart" },
  { name: "ADDRESS", path: "/checkout/address" },
  { name: "PAYMENT", path: "/checkout/payment" },
];

const CheckoutNavbar = () => {
  const location = useLocation();
  const activeIndex = steps.findIndex((s) => s.path === location.pathname);

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* LEFT SECTION: Logo & Mobile Back */}
        <div className="flex items-center gap-4 w-1/4">
          {/* Desktop Logo */}
          <Link
            to="/"
            className="hidden md:flex transition-opacity hover:opacity-70">
            <img
              src={IMAGES.brand.logo}
              alt="Brand Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Mobile Back Button */}
          <Link
            to="/"
            className="md:hidden flex text-gray-800 hover:text-[#007673] transition-colors">
            <ArrowLeft size={22} strokeWidth={1.5} />
          </Link>
        </div>

        {/* CENTER SECTION: Progressive Steps (Desktop & Tablet) */}
        <div className="hidden sm:flex items-center justify-center gap-4 flex-1 mt-1">
          {steps.map((step, index) => {
            const isActive = activeIndex === index;

            return (
              <React.Fragment key={index}>
                <Link
                  to={step.path}
                  className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    isActive
                      ? "text-[#007673] border-b-2 border-[#007673] pb-1"
                      : "text-gray-400 hover:text-gray-600"
                  }`}>
                  {step.name}
                </Link>

                {/* Dashed Separator */}
                {index < steps.length - 1 && (
                  <div className="w-8 md:w-12 border-t border-dashed border-gray-300 mb-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Current Phase Name (Center on Mobile) */}
        <div className="sm:hidden flex-1 text-center text-[12px] font-bold uppercase tracking-widest text-[#007673] border-b-2 border-[#007673] pb-1 inline-block w-max mx-auto">
          {steps[activeIndex]?.name || "CHECKOUT"}
        </div>

        {/* RIGHT SECTION: Secure Badge */}
        <div className="flex items-center justify-end gap-2 w-1/4 opacity-80 hover:opacity-100 transition-opacity">
          <ShieldCheck size={18} className="text-[#007673]" strokeWidth={2} />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:block mt-0.5">
            100% Secure
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutNavbar;
