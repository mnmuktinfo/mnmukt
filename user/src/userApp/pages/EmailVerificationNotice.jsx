import { useEffect, useState } from "react";
import { applyActionCode, getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  // Custom color scheme
  const COLORS = {
    primary: "#ff356c",
    secondary: "#e0e0e0",
    text: "#2d3748",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
  };

  useEffect(() => {
    const auth = getAuth();

    // Read query params
    const url = new URL(window.location.href);
    const mode = url.searchParams.get("mode");
    const oobCode = url.searchParams.get("oobCode");

    if (mode !== "verifyEmail" || !oobCode) {
      setStatus("invalid");
      return;
    }

    // Verify email using Firebase
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("success");
        // Clear any cached auth state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleNavigateToLogin = () => {
    navigate("/account/login");
  };

  const handleNavigateToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 md:rounded-2xl md:shadow-lg">
        {/* Header */}
        <h2 className="text-3xl font-[lora] text-[#ff356c] text-center mb-4">
          Email Verification
        </h2>

        {/* Content */}
        <div className="space-y-6">
          {/* Loading State */}
          {status === "loading" && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-200 border-t-[#ff356c] rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#ff356c]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: COLORS.text }}>
                  Verifying Your Email
                </h3>
                <p className="text-sm" style={{ color: COLORS.text }}>
                  Please wait while we confirm your email address...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: COLORS.text }}>
                  Email Verified Successfully!
                </h3>
                <p className="text-sm" style={{ color: COLORS.text }}>
                  Your email has been verified. You now have full access to your
                  account.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleNavigateToDashboard}
                  className="w-full bg-[#ff356c] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200">
                  Go to Dashboard
                </button>
                <button
                  onClick={handleNavigateToLogin}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200">
                  Sign In Now
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: COLORS.text }}>
                  Verification Failed
                </h3>
                <p className="text-sm mb-4" style={{ color: COLORS.text }}>
                  The verification link is invalid or has expired.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    Possible reasons:
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• The link has already been used</li>
                    <li>• The link has expired (usually 24 hours)</li>
                    <li>• Invalid verification code</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-[#ff356c] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200">
                  Try Again
                </button>
                <Link
                  to="/resend-verification"
                  className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center">
                  Request New Verification Email
                </Link>
              </div>
            </div>
          )}

          {/* Invalid State */}
          {status === "invalid" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: COLORS.text }}>
                  Invalid Request
                </h3>
                <p className="text-sm" style={{ color: COLORS.text }}>
                  This verification link appears to be malformed or incomplete.
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  to="/account/login"
                  className="block w-full bg-[#ff356c] hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-center">
                  Go to Login
                </Link>
                <Link
                  to="/"
                  className="block text-[#ff356c] hover:opacity-80 text-sm font-medium text-center">
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs" style={{ color: COLORS.text }}>
            Need help?{" "}
            <Link
              to="/support"
              className="font-medium"
              style={{ color: COLORS.primary }}>
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
