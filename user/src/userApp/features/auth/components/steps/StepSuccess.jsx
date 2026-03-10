import React from "react";
import { Link } from "react-router-dom";

const StepSuccess = ({
  signupMethod = "email",
  email = "user@example.com",
}) => {
  const isGoogle = signupMethod === "google";

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-6 text-center z-[100]">
      {/* 1. MINIMAL SUCCESS ICON */}
      <div className="relative mb-12">
        {/* Subtle breath ring */}
        <div className="absolute inset-0 bg-red-50 rounded-full scale-150 opacity-40"></div>

        <div className="relative w-20 h-20 bg-white shadow-2xl shadow-red-100 rounded-full flex items-center justify-center z-10 border border-slate-50">
          <svg
            className="w-8 h-8 text-[#ff356c]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* 2. HEADLINES */}
      <div className="max-w-lg">
        <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 mb-6">
          {isGoogle ? "Registration " : "Verify your "}
          <span className="italic font-serif text-[#ff356c]">
            {isGoogle ? "Complete." : "Inbox."}
          </span>
        </h2>

        <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-12 max-w-md mx-auto font-light">
          {isGoogle ? (
            "Your identity has been verified via Google. Welcome to the Mnmukt ecosystem."
          ) : (
            <>
              A security link has been dispatched to <br />
              <span className="text-slate-950 font-medium underline decoration-red-200 underline-offset-8">
                {email}
              </span>
            </>
          )}
        </p>

        {/* 3. PRIMARY ACTION */}
        <div className="flex flex-col items-center gap-8">
          <Link
            to="/"
            className="px-14 py-5 bg-slate-950 text-white text-[10px] uppercase tracking-[0.5em] font-black hover:bg-[#ff356c] transition-all shadow-xl shadow-slate-200">
            {isGoogle ? "Enter Dashboard" : "I have verified"}
          </Link>

          {/* 4. SUB ACTION */}
          {!isGoogle ? (
            <button className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-300 hover:text-slate-900 transition-colors">
              Resend Identity Link
            </button>
          ) : (
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">
              Mnmukt Security Protocol Active
            </p>
          )}
        </div>
      </div>

      {/* 5. FOOTER BADGE */}
      <div className="absolute bottom-12 flex items-center gap-3 opacity-30">
        <div className="w-8 h-[1px] bg-slate-900"></div>
        <span className="text-[8px] uppercase tracking-[0.6em] font-bold text-slate-900">
          Encrypted & Secure
        </span>
        <div className="w-8 h-[1px] bg-slate-900"></div>
      </div>
    </div>
  );
};

export default StepSuccess;
