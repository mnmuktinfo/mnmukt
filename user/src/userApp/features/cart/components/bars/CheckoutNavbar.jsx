import { ArrowLeft, ShieldCheck } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IMAGES } from "../../../../../assets/images";

const steps = [
  { name: "Bag", path: "/checkout/cart" },
  { name: "Address", path: "/checkout/address" },
  { name: "Payment", path: "/checkout/payment" },
];

const CheckoutNavbar = () => {
  const location = useLocation();
  const activeIndex = steps.findIndex((s) => s.path === location.pathname);

  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 w-1/4">
          {/* Desktop Logo */}
          <Link to="/" className="hidden md:flex">
            <img
              src={IMAGES.brand.logo}
              alt="Brand Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Mobile Back */}
          <Link to="/" className="md:hidden text-gray-700 hover:text-[#f43397]">
            <ArrowLeft size={22} />
          </Link>
        </div>

        {/* CENTER STEP PROGRESS */}
        <div className="hidden sm:flex items-center justify-center flex-1">
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;

            return (
              <React.Fragment key={index}>
                <Link to={step.path} className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold transition-all
                      ${
                        isActive
                          ? "bg-[#f43397] text-white"
                          : isCompleted
                            ? "bg-[#f43397]/20 text-[#f43397]"
                            : "bg-gray-200 text-gray-500"
                      }`}>
                    {index + 1}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide mt-1
                    ${isActive ? "text-[#f43397]" : "text-gray-400"}`}>
                    {step.name}
                  </span>
                </Link>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="w-10 h-[2px] bg-gray-200 mx-2">
                    <div
                      className={`h-[2px] ${
                        index < activeIndex ? "bg-[#f43397]" : ""
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* MOBILE STEP NAME */}
        <div className="sm:hidden flex-1 text-center text-[12px] font-bold uppercase tracking-widest text-[#f43397]">
          {steps[activeIndex]?.name || "Checkout"}
        </div>

        {/* RIGHT SECURE */}
        <div className="flex items-center justify-end gap-2 w-1/4 opacity-80">
          <ShieldCheck size={18} className="text-[#f43397]" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden md:block">
            100% Secure
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutNavbar;
