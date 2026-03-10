import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Home, Plus } from "lucide-react";

const AddressSection = ({ address, loading }) => {
  const navigate = useNavigate();

  // Redirect to the full Edit Profile page for any address changes
  const handleEditRedirect = () => {
    navigate("/user/profile/edit");
  };

  /* =========================================
     LOADING SKELETON
  ========================================= */
  if (loading) {
    return (
      <div className="p-6 border-t border-gray-100 animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-100 rounded w-32"></div>
        </div>
        <div className="h-24 bg-gray-50 rounded-xl w-full border border-gray-100"></div>
      </div>
    );
  }

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div className="p-6 border-t border-gray-100">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <MapPin size={14} className="text-red-600" />
          Delivery Location
        </h3>

        {/* 'Change' button redirects to Edit Page */}
        {address && (
          <button
            onClick={handleEditRedirect}
            className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide transition-colors">
            Change
          </button>
        )}
      </div>

      {address ? (
        // --- SCENARIO A: ADDRESS EXISTS (View Only) ---
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-default">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
            <Home size={20} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-gray-900">Home</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">
                Default
              </span>
            </div>

            {/* Address Lines */}
            <p className="text-sm text-gray-600 leading-relaxed truncate">
              {address.line1}
            </p>
            <p className="text-sm text-gray-500">
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </div>
      ) : (
        // --- SCENARIO B: NO ADDRESS (Redirect to Add) ---
        <button
          onClick={handleEditRedirect}
          className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-red-50/50 hover:border-red-200 transition-all group">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-red-500 group-hover:border-red-200 transition-colors shadow-sm">
            <Plus size={24} />
          </div>
          <div className="text-center">
            <span className="block text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              Add New Address
            </span>
            <span className="text-xs text-gray-500">
              Tap to add your delivery location
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default AddressSection;
