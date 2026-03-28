import React from "react";

const StepSelectMethod = ({
  setStep,
  setEmail,
  email,
  setError,
  onGoogleSignup,
  onFacebookSignup,
  loading,
}) => {
  const handleContinue = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    setError("");
    setStep(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Email form */}
      <form onSubmit={handleContinue} className="space-y-5">
        {/* Email Input with Icon */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#E0006C] transition-colors">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(""); // ✅ clear error as user types
            }}
            placeholder="Email address"
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200  text-[15px] text-gray-900 outline-none focus:bg-white focus:border-[#E0006C] focus:ring-4 focus:ring-[#E0006C]/10 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#E0006C] text-white text-[15px] tracking-wide font-bold  transition-all hover:shadow-lg hover:shadow-[#E0006C]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center">
          CONTINUE
        </button>
      </form>

      {/* Divider */}
      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social buttons (Side-by-side Pill Layout) */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Google */}
        <button
          type="button"
          onClick={onGoogleSignup}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 bg-white border border-gray-200  hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm font-semibold text-gray-700 active:scale-[0.98]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
          <span>{loading ? "..." : "Google"}</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={onFacebookSignup}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 bg-white border border-gray-200  hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm font-semibold text-gray-700 active:scale-[0.98]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#1877F2">
            <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
          </svg>
          <span>{loading ? "..." : "Facebook"}</span>
        </button>
      </div>
    </div>
  );
};

export default StepSelectMethod;
