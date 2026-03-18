import React from "react";

const AuthRedirect = ({ navigate }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-[#fcfcfc]">
    <span className="text-[#da127d] text-[10px] uppercase tracking-[0.4em] font-semibold mb-4 block">
      Account Required
    </span>
    <h2
      className="text-3xl sm:text-4xl font-light text-gray-900 mb-8 leading-tight"
      style={{ fontFamily: "'Playfair Display', serif" }}>
      Please Sign In to <br />
      <span className="italic text-gray-400">View Your Orders</span>
    </h2>
    <button
      onClick={() => navigate("/auth/login")}
      className="px-10 py-4 bg-gray-900 text-white text-[10px] font-semibold uppercase tracking-[0.4em] hover:bg-gray-800 transition-colors">
      Sign In
    </button>
  </div>
);

export default AuthRedirect;
