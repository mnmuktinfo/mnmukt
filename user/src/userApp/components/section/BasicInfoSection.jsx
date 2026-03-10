import React from "react";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BasicInfoSection = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="py-4 px-6 border-b border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-md md:text-xl font-crimson text-gray-900">
          BASIC INFORMATION
        </h3>

        <button
          onClick={() => navigate("/user/profile/edit")}
          className="flex items-center gap-2 text-red-600 hover:opacity-80 font-medium">
          <Edit size={16} />
          <span className="text-sm">Edit</span>
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12">
        <Info label="Name" value={data.name} />
        {/* <Info label="Last Name" value={data.lastName} /> */}
        <Info label="Email" value={data.email} />
        <Info label="Gender" value={data.gender} />
        <Info label="Date of Birth" value={data.dateOfBirth} />
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="flex items-center">
    <span className="text-sm text-gray-500 w-32">{label}</span>
    <span className="text-gray-900 text-sm">{value || "-"}</span>
  </div>
);

export default BasicInfoSection;
