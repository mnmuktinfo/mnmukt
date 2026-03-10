import { ArrowLeft, ShieldCheck } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IMAGES } from "../../../../../assets/images";

const steps = [
  { name: "BAG", path: "/checkout/cart" },
  { name: "ADDRESS", path: "/checkout/address" },
  { name: "PAYMENT", path: "/checkout/payment" },
];

const CheckoutNavbar = () => {
  const location = useLocation();
  const activeIndex = steps.findIndex((s) => s.path === location.pathname);
  const activeStep = steps[activeIndex];

  return (
    <div className="w-full bg-white border-b border-slate-50 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
        {/* LEFT SECTION: Logo & Mobile Back */}
        <div className="flex items-center gap-8">
          {/* Desktop Logo */}
          <Link
            to="/"
            className="hidden md:flex transition-opacity hover:opacity-70">
            <img src={IMAGES.brand.logo} alt="Mnmukt" className="h-7 w-auto" />
          </Link>

          {/* Mobile Back Button */}
          <Link to="/" className="md:hidden flex text-slate-900">
            <ArrowLeft size={22} strokeWidth={1.5} />
          </Link>

          {/* Mobile Current Phase Name */}
          <div className="md:hidden text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">
            {activeStep?.name === "BAG" ? "Acquisition Bag" : activeStep?.name}
          </div>
        </div>

        {/* CENTER SECTION: Progressive Steps (Desktop) */}
        <div className="hidden md:flex items-center gap-12">
          {steps.map((step, index) => {
            const isActive = location.pathname === step.path;
            const isCompleted = activeIndex > index;

            return (
              <React.Fragment key={index}>
                <div className="flex items-center gap-3">
                  <Link
                    to={step.path}
                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
                      isActive
                        ? "text-[#ff356c]"
                        : isCompleted
                          ? "text-slate-950"
                          : "text-slate-300"
                    }`}>
                    {step.name}
                  </Link>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-[#ff356c]" />
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="w-12 h-[1px] bg-slate-100" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* RIGHT SECTION: Security HUD */}
        <div className="flex items-center gap-3 opacity-40 md:opacity-100">
          <ShieldCheck size={16} className="text-[#ff356c]" strokeWidth={1.5} />
          <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] hidden sm:block">
            Secure Acquisition
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutNavbar;
