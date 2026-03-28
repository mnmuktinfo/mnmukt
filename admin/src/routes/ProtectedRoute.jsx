// routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext"; // adjust path

export const ProtectedRoute = ({ children }) => {
  const { isAuthorized, loading } = useAdminAuth();
  console.log(isAuthorized);

  if (loading) {
    // Show your spinner/loading UI while auth state is being verified
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#2874f0] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
