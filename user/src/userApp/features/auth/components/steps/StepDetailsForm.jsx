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
    if (!userInfo.name || !userInfo.password) {
      setLocalError("All fields are required");
      return;
    }
    if (userInfo.password !== userInfo.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    onSubmit();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-3xl font-light tracking-tighter text-slate-900 mb-2">
          Secure{" "}
          <span className="italic font-serif text-[#ff356c]">Profile.</span>
        </h2>
        <p className="text-slate-400 text-sm">
          Define your identity and access credentials.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-10">
        {/* Name Input */}
        <div className="relative group">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            required
            className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
            value={userInfo.name}
            onChange={handleChange}
          />
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="flex justify-between items-end mb-1">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[10px] uppercase tracking-widest text-[#ff356c] font-black">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            required
            className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
            value={userInfo.password}
            onChange={handleChange}
          />
        </div>

        {/* Confirm Password */}
        <div className="relative group">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="••••••••"
            required
            className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
            value={userInfo.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {/* Local Error Display */}
        {localError && (
          <p className="text-[#ff356c] text-[10px] uppercase tracking-widest font-black text-center">
            {localError}
          </p>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#ff356c] transition-colors disabled:opacity-50">
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-[10px] uppercase tracking-[0.3em] font-bold text-slate-300 hover:text-slate-900 transition-colors">
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepDetailsForm;
