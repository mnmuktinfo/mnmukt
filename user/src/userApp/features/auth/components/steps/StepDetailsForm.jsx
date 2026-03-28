import { useState } from "react";

const StepDetailsForm = ({
  setStep,
  userInfo,
  setUserInfo,
  loading,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    setLocalError("");
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (!userInfo.name?.trim()) {
      setLocalError("Full name is required.");
      return;
    }
    if (!userInfo.password || userInfo.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (userInfo.password !== userInfo.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLocalError("");
    onSubmit();
  };

  return (
    <div className="w-full animate-fade-in">
      {/* Sub-instruction */}
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Define your identity and secure your access credentials.
      </p>

      {/* Local Error Message (Sharp Corners) */}
      {localError && (
        <div className="w-full flex items-start gap-3 text-[#E0006C] text-sm font-medium bg-[#E0006C]/10 px-4 py-3 rounded-none mb-6 border border-[#E0006C]/20">
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
        {/* Full Name Input */}
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-none text-[15px] text-gray-900 outline-none focus:bg-white focus:border-[#E0006C] focus:ring-4 focus:ring-[#E0006C]/10 transition-all placeholder:text-gray-400"
            value={userInfo.name}
            onChange={handleChange}
          />
        </div>

        {/* Password Header / Toggle */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[13px] font-semibold text-[#E0006C] hover:text-[#b30056] transition-colors flex items-center gap-1.5">
            {showPassword ? (
              <>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
                Hide Passwords
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Show Passwords
              </>
            )}
          </button>
        </div>

        {/* Password Input */}
        <div className="relative group mt-1">
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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create Password"
            required
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-none text-[15px] text-gray-900 outline-none focus:bg-white focus:border-[#E0006C] focus:ring-4 focus:ring-[#E0006C]/10 transition-all placeholder:text-gray-400"
            value={userInfo.password}
            onChange={handleChange}
          />
        </div>

        {/* Confirm Password Input */}
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
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            className="block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-none text-[15px] text-gray-900 outline-none focus:bg-white focus:border-[#E0006C] focus:ring-4 focus:ring-[#E0006C]/10 transition-all placeholder:text-gray-400"
            value={userInfo.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {/* Actions (Sharp Corners) */}
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E0006C] text-white text-[15px] tracking-wide font-bold rounded-none transition-all hover:shadow-lg hover:shadow-[#E0006C]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center">
            {loading ? (
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
              "COMPLETE REGISTRATION"
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-3.5 bg-white text-gray-600 text-[15px] font-semibold rounded-none border border-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] flex items-center justify-center gap-2">
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

export default StepDetailsForm;
