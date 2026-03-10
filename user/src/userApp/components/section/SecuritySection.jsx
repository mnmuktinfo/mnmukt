// components/account/sections/SecuritySection.jsx
import React from "react";
import { Shield } from "lucide-react";

const SecuritySection = ({ onChangePassword }) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md  uppercase md:text-xl font-crimson font-inter text-gray-900">
          Security
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Password
            </label>
            <p className="text-gray-900 font-medium">••••••••</p>
          </div>
          <button
            onClick={onChangePassword}
            className="flex items-center space-x-2 underline text-red-400 hover:text-purple-700 font-medium">
            <Shield color="red" size={16} />
            <span>Change</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
