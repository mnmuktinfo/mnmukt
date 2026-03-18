import React from "react";
import { ChevronRight, MapPin, HelpCircle } from "lucide-react";

// ─── ADDRESS & HELP ───
const AddressAndHelp = ({ order, navigate }) => (
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
    {order.addressSnapshot && (
      <div className="flex-1 bg-white p-5 sm:rounded-md sm:border border-gray-200">
        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-[#535766] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[11px] font-bold text-[#535766] uppercase tracking-widest mb-2">
              Delivery Address
            </h3>
            <p className="text-[14px] font-bold text-[#282C3F] mb-1">
              {order.addressSnapshot.name}
            </p>
            <p className="text-[13px] text-[#535766] leading-relaxed pr-4">
              {order.addressSnapshot.line1}, {order.addressSnapshot.city},{" "}
              {order.addressSnapshot.state} -{" "}
              <span className="font-bold text-[#282C3F]">
                {order.addressSnapshot.pincode}
              </span>
            </p>
            <p className="text-[13px] font-medium text-[#282C3F] mt-2">
              +91 {order.addressSnapshot.phone}
            </p>
          </div>
        </div>
      </div>
    )}

    <div
      onClick={() => navigate("/contact")}
      className="bg-white p-5 sm:rounded-md sm:border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors sm:w-1/3">
      <div className="flex items-center gap-3">
        <HelpCircle size={22} className="text-[#535766]" />
        <div>
          <h3 className="text-[14px] font-bold text-[#282C3F]">Need Help?</h3>
          <p className="text-[12px] text-[#535766]">Contact our support</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </div>
  </div>
);

export default AddressAndHelp;
