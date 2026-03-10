import React from "react";
import { IMAGES } from "../../../assets/images";

const GoogleButton = ({ handleGoogle }) => {
  return (
    <div>
      <button
        onClick={handleGoogle}
        className="w-full mt-8 py-3 rounded-lg flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200">
        <div className="bg-white p-1 rounded">
          <img src={IMAGES.goggle_logo} alt="Google Logo" className="w-5 h-5" />
        </div>
        Continue with Google
      </button>
    </div>
  );
};

export default GoogleButton;
