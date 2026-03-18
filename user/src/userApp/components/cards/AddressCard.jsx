import React from "react";

const AddressCard = ({ address, onEdit }) => {
  if (!address) return null;

  const { name, city, state, pincode, phone, tag } = address;

  // Handle fallback for address line 1
  const line1 = address.line1 || address.addressLine1;

  return (
    <div className="w-full bg-white border border-gray-200  p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col relative">
      {/* --- TOP ROW: Name, Tag & Edit --- */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 capitalize tracking-tight">
            {name}
          </h4>
          {tag && (
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {tag}
            </span>
          )}
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            aria-label={`Edit address for ${name}`}
            className="text-[#f43397] text-xs sm:text-sm font-bold uppercase tracking-wide hover:bg-[#f43397]/10 px-3 py-1.5 rounded-lg transition-colors shrink-0">
            Edit
          </button>
        )}
      </div>

      {/* --- MIDDLE ROW: Address Details --- */}
      <div className="text-sm sm:text-base text-gray-600 leading-relaxed pr-2 sm:pr-8">
        <p className="text-gray-700">{line1}</p>
        <p className="mt-1">
          {city}, {state}{" "}
          <span className="font-bold text-gray-900 ml-1">{pincode}</span>
        </p>
      </div>

      {/* --- BOTTOM ROW: Contact Info --- */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
        <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
          {/* Optional: A simple phone icon adds a nice visual touch */}
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>
            Phone: <span className="font-bold text-gray-900 ml-1">{phone}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
