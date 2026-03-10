import React from "react";

const StepSelectMethod = ({
  setStep,
  setEmail,
  email,
  onGoogleSignup,
  loading,
}) => {
  const handleContinue = (e) => {
    console.log("button clicked");
    e.preventDefault();
    if (email.trim()) {
      setStep(2);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-3xl font-light tracking-tighter text-slate-900 mb-2">
          Create{" "}
          <span className="italic font-serif text-[#ff356c]">Account.</span>
        </h2>
        <p className="text-slate-400 text-sm">
          Select your preferred method to join.
        </p>
      </div>

      <div className="space-y-10">
        {/* Google Method */}
        <button
          onClick={onGoogleSignup}
          disabled={loading}
          className="w-full py-4 border border-slate-100 rounded-sm flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C9.03,19.27 6.59,17.03 6.59,12C6.59,6.97 9.06,4.73 12.18,4.73C14.4,4.73 16.31,5.77 17.22,7.39L19.41,5.7C18.15,3.46 15.42,2 12.18,2C6.82,2 4,6.59 4,12C4,17.41 6.82,22 12.18,22C17.3,22 21.5,18.33 21.5,12C21.5,11.54 21.41,11.1 21.35,11.1V11.1Z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="grow border-t border-slate-50"></div>
          <span className="shrink mx-4 text-[10px] uppercase tracking-[0.3em] text-slate-200">
            or use email
          </span>
          <div className="grow border-t border-slate-50"></div>
        </div>

        {/* Email Quick Entry */}
        <form onSubmit={handleContinue} className="space-y-10">
          <div className="relative group">
            <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#ff356c] transition-colors shadow-2xl shadow-slate-100">
            {loading ? "Processing..." : "Continue with Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StepSelectMethod;
