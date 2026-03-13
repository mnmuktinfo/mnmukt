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
    <div className="w-full">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-3xl font-light tracking-tighter text-slate-900 mb-2">
          Contact{" "}
          <span className="italic font-serif text-[#ff356c]">Details.</span>
        </h2>
        <p className="text-slate-400 text-sm">
          We'll use these to reach you and verify your account.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-10">
        {/* Email */}
        <div className="relative group">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError("");
            }}
            className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
          />
        </div>

        {/* Mobile */}
        <div className="relative group">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
            Mobile Number
          </label>
          <div className="flex items-end border-b border-slate-200 focus-within:border-[#ff356c] transition-all">
            {/* Country code — static for now */}
            <span className="py-3 pr-3 text-lg text-slate-400 select-none">
              +91
            </span>
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
              className="flex-1 bg-transparent py-3 outline-none text-lg placeholder:text-slate-100"
            />
          </div>
        </div>

        {/* Local error */}
        {localError && (
          <p className="text-[#ff356c] text-[10px] uppercase tracking-widest font-black text-center">
            {localError}
          </p>
        )}

        {/* Actions */}
        <div className="pt-4 space-y-6">
          <button
            type="submit"
            className="w-full py-5 bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#ff356c] transition-colors">
            Continue
          </button>

          <button
            type="button"
            onClick={() => {
              setLocalError("");
              setStep(0);
            }}
            className="w-full text-[10px] uppercase tracking-[0.3em] font-bold text-slate-300 hover:text-slate-900 transition-colors">
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepEmailForm;
