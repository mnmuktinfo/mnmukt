import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../../../../config/firebaseAuth";
import { sendEmailVerification } from "firebase/auth";

/* ════════════════════════════════════════════════════════════
   Firebase sends the verification email automatically inside
   signupUser() via sendEmailVerification(user).
   This component just shows status + allows resend.
════════════════════════════════════════════════════════════ */

/* ── Per-method display config ───────────────────────────── */
const METHOD_CONFIG = {
  google: {
    headline: "Registration",
    accent: "Complete.",
    body: "Your identity has been verified via Google. Welcome to the Taruveda ecosystem.",
    cta: "Enter Dashboard",
    badge: "Verified via Google",
    showResend: false,
  },
  facebook: {
    headline: "Registration",
    accent: "Complete.",
    body: "Your identity has been verified via Facebook. Welcome to the Taruveda ecosystem.",
    cta: "Enter Dashboard",
    badge: "Verified via Facebook",
    showResend: false,
  },
  email: {
    headline: "Verify your",
    accent: "Inbox.",
    body: null, // rendered with live email address below
    cta: "I've Verified — Continue",
    badge: "Encrypted & Secure",
    showResend: true,
  },
};

/* ── Animated check ──────────────────────────────────────── */
const AnimatedCheck = () => (
  <div className="relative mb-12">
    <div className="absolute inset-0 rounded-full bg-red-50 animate-ping opacity-20 scale-150" />
    <div className="absolute inset-0 rounded-full bg-red-50 opacity-40 scale-150" />
    <div className="relative w-20 h-20 bg-white shadow-2xl shadow-red-100 rounded-full flex items-center justify-center z-10 border border-slate-50">
      <svg
        className="w-8 h-8 text-[#ff356c]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
const StepSuccess = ({
  signupMethod = "email", // "email" | "google" | "facebook"
  email = "",
  name = "",
}) => {
  const config = METHOD_CONFIG[signupMethod] ?? METHOD_CONFIG.email;

  // "idle" = email was sent by signupUser() already
  // "sending" = resend in progress
  // "sent"    = resend succeeded
  // "failed"  = resend failed
  const [resendStatus, setResendStatus] = useState("idle");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  /* ── Resend Firebase verification email ───────────────── */
  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const user = auth.currentUser;
    if (!user) {
      setResendStatus("failed");
      return;
    }

    setResendStatus("sending");
    try {
      await sendEmailVerification(user);
      setResendStatus("sent");
      startCooldown();
    } catch (err) {
      console.error("[StepSuccess] Resend failed:", err);
      setResendStatus("failed");
    }
  };

  /* ── Email status line (email method only) ────────────── */
  const EmailStatusLine = () => {
    if (signupMethod !== "email") return null;
    return (
      <div className="mb-6 flex items-center justify-center gap-2">
        {/* Initial state — email was already sent by signupUser() */}
        {resendStatus === "idle" && (
          <>
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Verification email sent to {email}
            </span>
          </>
        )}
        {resendStatus === "sending" && (
          <>
            <div className="w-3 h-3 rounded-full border-2 border-[#ff356c] border-t-transparent animate-spin" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Sending...
            </span>
          </>
        )}
        {resendStatus === "sent" && (
          <>
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Resent to {email}
            </span>
          </>
        )}
        {resendStatus === "failed" && (
          <>
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Failed to resend — try again
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-6 text-center z-[100]">
      <AnimatedCheck />

      <div className="max-w-lg">
        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 mb-6">
          {config.headline}{" "}
          <span className="italic font-serif text-[#ff356c]">
            {config.accent}
          </span>
        </h2>

        {/* Email status */}
        <EmailStatusLine />

        {/* Body text */}
        <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-12 max-w-md mx-auto font-light">
          {config.body ?? (
            <>
              A verification link has been sent to{" "}
              <span className="text-slate-950 font-medium underline decoration-red-200 underline-offset-8">
                {email || "your inbox"}
              </span>
              .{" "}
              <span className="text-sm">
                Check your spam folder if you don't see it.
              </span>
            </>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-8">
          <Link
            to="/"
            className="px-14 py-5 bg-slate-950 text-white text-[10px] uppercase tracking-[0.5em] font-black hover:bg-[#ff356c] transition-all shadow-xl shadow-slate-200">
            {config.cta}
          </Link>

          {/* Resend — email only */}
          {config.showResend && (
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendStatus === "sending"}
              className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-300 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Verification Email"}
            </button>
          )}

          {/* Social badge */}
          {!config.showResend && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">
              {config.badge}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 flex items-center gap-3 opacity-30">
        <div className="w-8 h-[1px] bg-slate-900" />
        <span className="text-[8px] uppercase tracking-[0.6em] font-bold text-slate-900">
          Encrypted & Secure
        </span>
        <div className="w-8 h-[1px] bg-slate-900" />
      </div>
    </div>
  );
};

export default StepSuccess;
