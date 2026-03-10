import React from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../button/CustomButton"; // Adjust path if needed
import { LogIn, X, ShieldCheck } from "lucide-react";

const LoginPopup = ({ setShowLoginModal }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate("/auth/login");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* 1. BACKDROP (Desktop Only) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity hidden md:block"
        onClick={() => setShowLoginModal(false)}
      />

      {/* 2. MAIN CONTAINER */}
      <div className="relative w-full h-full md:h-auto md:max-w-sm bg-white md:rounded-3xl shadow-2xl flex flex-col p-6 md:p-8 animate-fade-in-up">
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-all active:scale-90">
          <X size={24} />
        </button>

        {/* CONTENT WRAPPER (Centered vertically on mobile) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 mt-10 md:mt-0">
          {/* Icon Circle */}
          <div className="relative mb-2">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-bounce-slow">
              <LogIn size={36} strokeWidth={1.5} />
            </div>
            {/* Decorative dots */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-200 rounded-full animate-pulse" />
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-red-300 rounded-full" />
          </div>

          {/* Text Content */}
          <div className="space-y-3 max-w-[280px]">
            <h3 className="text-2xl font-serif font-bold text-gray-900">
              Unlock the Best Experience
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Login to track orders, save your wishlist, and get exclusive
              offers.
            </p>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <ShieldCheck size={14} className="text-green-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              100% Secure Login
            </span>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-auto md:mt-8 space-y-4 w-full">
          <CustomButton
            text="Login or Sign Up"
            onClick={handleLogin}
            className="w-full h-14 text-sm font-bold uppercase tracking-widest shadow-lg shadow-red-100"
            variant="primary" // Assuming your button supports variants
          />

          <button
            onClick={() => setShowLoginModal(false)}
            className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
