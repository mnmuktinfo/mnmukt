import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../../../config/firebaseAuth";

const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  RESET: "reset",
};

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get("mode"),
    oobCode: params.get("oobCode"),
  };
}

export default function FirebaseActionPage() {
  const [status, setStatus] = useState(STATUS.LOADING);
  const [oobCode, setOobCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("");

  // Guard to prevent React 18 Strict Mode double-firing
  const isMounted = useRef(false);

  // UX states for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Stop the effect from running twice
    if (isMounted.current) return;
    isMounted.current = true;

    const { mode, oobCode } = getParams();

    if (!mode || !oobCode) {
      setStatus(STATUS.ERROR);
      setMessage("This link is invalid or missing information.");
      return;
    }

    setOobCode(oobCode);
    setMode(mode);

    if (mode === "verifyEmail") verifyEmail(oobCode);
    else if (mode === "resetPassword") checkResetCode(oobCode);
    else {
      setStatus(STATUS.ERROR);
      setMessage("Unknown request type.");
    }
  }, []);

  async function verifyEmail(code) {
    try {
      await applyActionCode(auth, code);
      setStatus(STATUS.SUCCESS);
      setMessage("Your email address has been successfully verified.");
    } catch {
      setStatus(STATUS.ERROR);
      setMessage("This verification link has expired or was already used.");
    }
  }

  async function checkResetCode(code) {
    try {
      await verifyPasswordResetCode(auth, code);
      setStatus(STATUS.RESET);
    } catch {
      setStatus(STATUS.ERROR);
      setMessage("This password reset link is invalid or has expired.");
    }
  }

  async function resetPassword() {
    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus(STATUS.SUCCESS);
      setMessage("Your password has been changed successfully.");
    } catch (err) {
      setStatus(STATUS.ERROR);
      setMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 sm:pt-24 px-6 font-sans">
      <div className="w-full max-w-[360px] flex flex-col items-center relative">
        {/* ── Top Back Button ── */}
        {(status === STATUS.RESET || status === STATUS.ERROR) && (
          <Link
            to="/auth/login"
            className="absolute -top-6 -left-2 p-2 text-gray-400 hover:text-[#df0059] transition-colors bg-white rounded-full z-10"
            aria-label="Go back">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        {/* ── LOADING STATE ── */}
        {status === STATUS.LOADING && (
          <div className="w-full flex flex-col items-center justify-center animate-fade-in mt-10">
            <svg
              className="animate-spin h-10 w-10 text-[#df0059] mb-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-[20px] font-semibold text-gray-900 mb-2 tracking-wide text-center">
              Verifying...
            </h2>
            <p className="text-[13px] text-gray-500 text-center leading-[1.6]">
              Please wait while we check your secure link.
            </p>
          </div>
        )}

        {/* ── RESET PASSWORD STATE ── */}
        {status === STATUS.RESET && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-2 tracking-wide text-center">
              Create New Password
            </h2>
            <p className="text-[13px] text-gray-500 text-center leading-[1.6] mb-8 px-2">
              Your new password must be unique from those previously used.
            </p>

            {/* Error Message */}
            {message && (
              <div className="w-full text-[#df0059] text-[13px] text-center font-medium bg-[#df0059]/5 py-2.5 rounded-[4px] border border-[#df0059]/20 mb-5 animate-fade-in">
                {message}
              </div>
            )}

            <div className="w-full space-y-4">
              {/* New Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage("");
                  }}
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-16 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-[#df0059] tracking-wide transition-colors p-1">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setMessage("");
                  }}
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-16 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-[#df0059] tracking-wide transition-colors p-1">
                  {showConfirm ? "HIDE" : "SHOW"}
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={resetPassword}
                disabled={isSubmitting || !password || !confirmPassword}
                className="w-full h-[52px] mt-2 bg-[#df0059] hover:bg-[#c2004d] active:scale-[0.98] text-white text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all disabled:opacity-70 flex items-center justify-center shadow-md shadow-[#df0059]/20">
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── SUCCESS STATE ── */}
        {status === STATUS.SUCCESS && (
          <div className="w-full flex flex-col items-center animate-fade-in text-center mt-6">
            <div className="w-20 h-20 bg-[#df0059]/10 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-[#df0059]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-[22px] font-semibold text-gray-900 mb-3 tracking-wide">
              {mode === "verifyEmail" ? "Email Verified!" : "Password Changed!"}
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-8 px-4">
              {message}
            </p>

            <Link
              to="/auth/login"
              className="w-full h-[52px] bg-[#df0059] hover:bg-[#c2004d] active:scale-[0.98] text-white text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all flex items-center justify-center shadow-sm">
              Back to Login
            </Link>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {status === STATUS.ERROR && (
          <div className="w-full flex flex-col items-center animate-fade-in text-center mt-6">
            <div className="w-20 h-20 bg-[#df0059]/10 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-[#df0059]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-[22px] font-semibold text-gray-900 mb-3 tracking-wide">
              Invalid Link
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-8 px-4">
              {message}
            </p>

            <Link
              to="/auth/login"
              className="w-full h-[52px] bg-[#df0059] hover:bg-[#c2004d] active:scale-[0.98] text-white text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all flex items-center justify-center shadow-sm">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
