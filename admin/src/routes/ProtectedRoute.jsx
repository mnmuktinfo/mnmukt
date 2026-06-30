import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

/**
 * ProtectedRoute - Guards routes that require authentication
 * Redirects to /auth if user is not authorized
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthorized, loading, admin } = useAdminAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check authorization
  if (!isAuthorized || !admin) {
    // Save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
