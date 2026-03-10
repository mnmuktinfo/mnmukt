import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../../config/firebase";

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
        throw new Error("No account found.");
      if (err.code === "auth/invalid-email") throw new Error("Invalid email.");
      throw new Error("Failed to send. Try again.");
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
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {!isSent ? (
          <div className="max-w-md">
            {/* Logo / Indicator */}
            <div className="mb-16">
              <div className="w-10 h-10 border border-slate-900 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-red-600 rounded-full" />
              </div>
            </div>

            {/* Header */}
            <header className="mb-12">
              <h1 className="text-5xl font-light tracking-tighter text-slate-950 mb-4">
                Forgot <span className="italic font-serif">Access?</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                Provide your email address to receive a secure restoration link.
              </p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400">
                  Email Identity
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-red-600 text-xl placeholder:text-slate-100 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-600 text-xs font-bold tracking-widest uppercase">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.5em] rounded-none hover:bg-red-600 transition-colors disabled:opacity-50">
                {loading ? "Verifying..." : "Initialize Reset"}
              </button>
            </form>

            <footer className="mt-20">
              <a
                href="/auth/login"
                className="text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 underline underline-offset-8 decoration-slate-100 hover:decoration-red-600">
                Back to Authentication
              </a>
            </footer>
          </div>
        ) : (
          /* FULL PAGE SUCCESS STATE (No Animation) */
          <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-center px-6">
            <div className="mb-10">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 text-3xl">✓</span>
              </div>
            </div>

            <h2 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 text-slate-950">
              Inbox <span className="italic font-serif">Check.</span>
            </h2>

            <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-md mx-auto mb-16">
              A recovery link has been dispatched to <br />
              <span className="text-slate-950 font-medium underline decoration-red-200 underline-offset-4">
                {email}
              </span>
            </p>

            <div className="flex flex-col items-center gap-8">
              <button
                onClick={() => setIsSent(false)}
                className="px-16 py-4 bg-slate-950 text-white font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-red-600">
                Got It
              </button>

              <button
                onClick={() => setIsSent(false)}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-300 hover:text-red-600 border-b border-transparent hover:border-red-600 pb-1">
                Resend Identity Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
