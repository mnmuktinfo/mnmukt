import { useState } from "react";

const StepEmailForm = ({
  email,
  setEmail,
  mobile,
  setMobile,
  setStep,
  setError,
}) => {
  const [localError, setLocalError] = useState("");

  const handleNext = (e) => {
    e.preventDefault();
    setLocalError("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setLocalError("Email address is required.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    // Mobile validation — 10 digit Indian number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile.trim()) {
      setLocalError("Mobile number is required.");
      return;
    }
    if (!mobileRegex.test(mobile.trim())) {
      setLocalError("Enter a valid 10-digit mobile number.");
      return;
    }

    setError("");
    setStep(2);
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Sub-instruction */}
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        We'll use these details to secure your account and send order updates.
      </p>

      {/* Local Error Message */}
      {localError && (
        <div className="w-full flex items-start gap-3 text-[#E0006C] text-sm font-medium bg-[#E0006C]/10 px-4 py-3  mb-6 border border-[#E0006C]/20">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{localError}</span>
        </div>
      )}

      <form onSubmit={handleNext} className="space-y-5">
        {/* Email Input */}
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
            name="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError("");
            }}
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200  text-[15px] text-gray-900 outline-none focus:bg-white focus:border-[#E0006C] focus:ring-4 focus:ring-[#E0006C]/10 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Mobile Input */}
        <div className="relative group flex items-center bg-gray-50/50 border border-gray-200  focus-within:bg-white focus-within:border-[#E0006C] focus-within:ring-4 focus-within:ring-[#E0006C]/10 transition-all overflow-hidden">
          {/* Icon & Country Code */}
          <div className="pl-4 pr-3 py-3.5 flex items-center gap-2 text-gray-400 group-focus-within:text-[#E0006C] transition-colors border-r border-gray-200 bg-gray-50/50 group-focus-within:bg-white">
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
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>
            <span className="text-[15px] font-medium text-gray-600 group-focus-within:text-gray-900">
              +91
            </span>
          </div>

          <input
            type="tel"
            name="mobile"
            placeholder="98765 43210"
            required
            maxLength={10}
            value={mobile}
            onChange={(e) => {
              // Only allow digits
              const digits = e.target.value.replace(/\D/g, "");
              setMobile(digits);
              setLocalError("");
            }}
            className="block w-full pl-3 pr-4 py-3.5 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full py-3.5 bg-[#E0006C] text-white text-[15px] tracking-wide font-bold  transition-all hover:shadow-lg hover:shadow-[#E0006C]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center">
            CONTINUE
          </button>

          <button
            type="button"
            onClick={() => {
              setLocalError("");
              setStep(0);
            }}
            className="w-full py-3.5 bg-white text-gray-600 text-[15px] font-semibold  border border-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] flex items-center justify-center gap-2">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepEmailForm;
