import React from "react";

const AddressCard = ({ address, onEdit }) => {
  if (!address) return null;

  return (
    <div className="w-full font-sans bg-transparent">
      {/* 1. TOP HEADER (Name & Edit Action) */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[14px] font-bold text-gray-900 capitalize tracking-wide">
          {address.name}
        </h4>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="text-[11px] font-bold text-[#007673] hover:underline uppercase tracking-widest transition-all">
          Edit
        </button>
      </div>

      {/* 2. ADDRESS DETAILS */}
      <div className="space-y-0.5 mb-4">
        <p className="text-[13px] text-gray-600 leading-relaxed pr-8">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>

        <p className="text-[13px] text-gray-600">
          {address.city}, {address.state} -{" "}
          <span className="font-bold text-gray-800">{address.pincode}</span>
        </p>

        <p className="text-[13px] text-gray-600 pt-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mr-2">
            Mobile:
          </span>
          <span className="font-bold text-gray-800">{address.phone}</span>
        </p>
      </div>

      {/* 3. LOGISTICS FOOTNOTE */}
      <div className="flex items-center gap-5 pt-3 border-t border-gray-100 mt-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Est. Delivery
          </span>
          <span className="text-[12px] font-medium text-gray-800">
            2 - 3 Days
          </span>
        </div>

        <div className="w-[1px] h-6 bg-gray-200"></div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Payment
          </span>
          <span className="text-[12px] font-medium text-gray-800">
            COD Available
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
