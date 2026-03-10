import React from "react";

const ConnectionErrorPage = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
      {/* Simple Offline SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-40 h-40 mb-8 text-pink-500"
        fill="none"
        viewBox="0 0 64 64"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M32 12v20m0 0l8-8m-8 8l-8-8m0 24v4a4 4 0 004 4h8a4 4 0 004-4v-4m-16 0h16"
        />
      </svg>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        CONNECTION ERROR
      </h1>

      {/* Subtext */}
      <p className="text-sm text-gray-500 mb-8">
        Page will auto-refresh when network comes back
      </p>

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded transition-colors">
        RETRY
      </button>
    </div>
  );
};

export default ConnectionErrorPage;
