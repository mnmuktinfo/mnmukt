import React from "react";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Continue Without Login?
        </h2>
        <p className="text-gray-600 mb-6">
          You won't be able to track your orders if you skip login.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition">
            Login
          </button>
          <button
            onClick={() => navigate("/order")}
            className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
            Continue as Guest
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
