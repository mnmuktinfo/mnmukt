import React from "react";
import { Link } from "react-router-dom";

const EmailVerificationHelp = () => {
  return (
    <div className="min-h-screen  flex items-start justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-3xl   p-6 sm:p-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Email Verification Help
          </h1>

          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            If you signed up on{" "}
            <span className="font-medium text-gray-800">MNMUKT</span>
            but cannot find the verification email, follow these steps.
          </p>
        </div>

        {/* Step 1 */}
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900">
            1. Check your Spam or Junk folder
          </h2>

          <p className="text-sm text-gray-600 mt-2">
            Email providers sometimes filter new messages. Please check the
            <span className="font-medium"> Spam</span> or
            <span className="font-medium"> Junk </span> folder in your email
            inbox.
          </p>

          {/* IMAGE */}
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
            <img
              src="https://lh7-us.googleusercontent.com/aCPiPXAKExRbZGmuqe_GNnr6gXq3QOPP7adA9CLLbZWITgh1u-iivpBCmf4Zi9vS4okxnj0dGZHQ2AE64QFdk2cWn5xRH2Vbj8RCphqy6wWHbAXSEIHgbIKmAYjLUfBf2H66QssPP9kWixv9CX9mdas"
              alt="Check spam folder"
              className="w-full object-contain max-h-[350px] bg-gray-50"
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900">
            2. Check the Promotions tab (Gmail users)
          </h2>

          <p className="text-sm text-gray-600 mt-2">
            Gmail sometimes places automated emails in the
            <span className="font-medium"> Promotions</span> tab instead of the
            main inbox.
          </p>
        </div>

        {/* Step 3 */}
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900">3. Search your inbox</h2>

          <p className="text-sm text-gray-600 mt-2">
            Use the search bar in your email and try keywords like:
          </p>

          <div className="mt-3 bg-gray-100 p-3 rounded-md text-sm text-gray-700 text-center">
            verify email • verification link • MNMUKT
          </div>
        </div>

        {/* Step 4 */}
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900">
            4. Resend the verification email
          </h2>

          <p className="text-sm text-gray-600 mt-2">
            If you still cannot find the email, go back and request a new
            verification email.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            to="/login"
            className="flex-1 text-center bg-black text-white py-2.5 rounded-md text-sm hover:bg-gray-800 transition">
            Back to Login
          </Link>

          <Link
            to="/verify-email"
            className="flex-1 text-center border border-gray-300 py-2.5 rounded-md text-sm hover:bg-gray-100 transition">
            Resend Verification Email
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-5 text-sm text-gray-500 text-center">
          If the problem continues, please contact MNMUKT support or try signing
          up with a different email provider.
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationHelp;
