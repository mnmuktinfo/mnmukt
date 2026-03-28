import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../../config/firebaseAuth";
import { Link } from "react-router-dom"; // Assuming you use react-router for navigation

const ForgotPasswordPage = () => {
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async (email) => {
    if (!email) throw new Error("Email is required.");
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      if (err.code === "auth/user-not-found")
        throw new Error("No account found with this email.");
      if (err.code === "auth/invalid-email")
        throw new Error("Please enter a valid email address.");
      throw new Error("Failed to send reset email. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 sm:pt-20 px-6 font-sans">
      <div className="w-full max-w-[360px] flex flex-col items-center">
        {!isSent ? (
          <div className="w-full flex flex-col items-center animate-fade-in">
            {/* ── Illustration with Orange Base Line ── */}
            <div className="mb-6 relative w-48 h-48 flex flex-col justify-center items-center">
              <svg
                viewBox="0 0 200 200"
                className="w-40 h-40 drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg">
                {/* Background Shadow Circle */}
                <circle
                  cx="100"
                  cy="110"
                  r="75"
                  fill="#f8f9fa"
                  stroke="#f1f2f6"
                  strokeWidth="2"
                />

                {/* Envelope */}
                <rect
                  x="45"
                  y="70"
                  width="110"
                  height="70"
                  rx="4"
                  fill="#ffffff"
                  stroke="#df0059"
                  strokeWidth="3"
                />
                <path
                  d="M45 70 L100 110 L155 70"
                  fill="none"
                  stroke="#df0059"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Lock Body */}
                <rect
                  x="80"
                  y="55"
                  width="40"
                  height="30"
                  rx="6"
                  fill="#df0059"
                />

                {/* Lock Shackle */}
                <path
                  d="M90 55 v-10 a10 10 0 0120 0 v10"
                  fill="none"
                  stroke="#df0059"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Keyhole */}
                <circle cx="100" cy="70" r="4" fill="#ffffff" />
                <path d="M98 72 h4 l-1 6 h-2 z" fill="#ffffff" />
              </svg>

              {/* Exact matching orange dashed ground-line from your image */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-[2px] w-32 bg-[#e85d22]"></div>
                <div className="h-[2px] w-8 bg-[#e85d22]"></div>
                <div className="h-[2px] w-4 bg-[#e85d22]"></div>
              </div>
            </div>

            {/* ── Heading & Subtitle ── */}
            <h2 className="text-[20px] font-medium text-gray-900 mb-3 tracking-wide">
              Forgot Password?
            </h2>
            <p className="text-[12px] text-gray-500 text-center leading-[1.6] mb-8 px-1">
              Please enter your registered email address we will get back to you
              with the reset password link and confirmation OTP thanks
            </p>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div className="relative">
                {/* Envelope Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" />
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M18 4L22 8" />
                  </svg>
                </div>

                {/* Input Field */}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] px-12 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all text-center placeholder:text-gray-400"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-[#df0059] text-[13px] text-center font-medium bg-[#df0059]/5 py-2 rounded">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#df0059] hover:bg-[#c2004d] active:scale-[0.98] text-white text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all disabled:opacity-70 flex items-center justify-center shadow-sm">
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Submit"
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link
                to="/auth/login"
                className="text-[13px] text-gray-500 hover:text-[#df0059] transition-colors font-medium">
                &larr; Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* ── Success State ── */
          <div className="w-full flex flex-col items-center animate-fade-in text-center mt-10">
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

            <h2 className="text-[20px] font-medium text-gray-900 mb-3 tracking-wide">
              Email Sent
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-8 px-4">
              We have sent the reset password link to <br />
              <strong className="text-gray-800 font-medium">{email}</strong>
            </p>

            <button
              onClick={() => setIsSent(false)}
              className="w-full h-[52px] border border-[#df0059] text-[#df0059] hover:bg-[#df0059]/5 active:scale-[0.98] text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all flex items-center justify-center">
              Try a different email
            </button>

            <div className="mt-6">
              <Link
                to="/auth/login"
                className="text-[13px] text-gray-500 hover:text-[#df0059] transition-colors font-medium">
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
