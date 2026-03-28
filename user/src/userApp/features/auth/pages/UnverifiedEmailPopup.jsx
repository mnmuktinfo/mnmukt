import React, { useState } from "react";
import { Mail, Loader2, CheckCircle2, X } from "lucide-react";
import { useAuth } from "../../auth/context/UserContext";
import { auth } from "../../../../config/firebaseAuth";
import { sendEmailVerification } from "firebase/auth";

const UnverifiedEmailPopup = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified || !visible) return null;

  const handleSend = async () => {
    if (!auth.currentUser) return;

    setLoading(true);

    try {
      await sendEmailVerification(auth.currentUser);
      setSent(true);

      setTimeout(() => {
        setVisible(false);
      }, 5000);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div
      className="
      fixed z-500
      
      /* Mobile */
      top-35 left-4 right-4
      
      /* Desktop */
      md:bottom-auto md:left-auto md:right-6 md:top-6 md:w-[340px]

      animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4
      ">
      <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        {/* Icon */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shrink-0">
          {sent ? <CheckCircle2 size={18} /> : <Mail size={18} />}
        </div>

        {/* Content */}
        <div className="flex-1 text-sm">
          {sent ? (
            <>
              <p className="font-semibold text-gray-900">
                Verification email sent
              </p>

              <p className="text-gray-500 text-xs mt-1">
                Check your inbox or spam folder.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900">Verify your email</p>

              <p className="text-gray-500 text-xs mt-1">
                Confirm your email to unlock full access.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="
                  inline-flex items-center gap-1.5
                  rounded-md
                  bg-gray-900 px-3 py-1.5
                  text-xs font-medium text-white
                  hover:bg-gray-800
                  active:scale-[0.97]
                  transition
                  disabled:opacity-70
                  ">
                  {loading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Send link"
                  )}
                </button>

                <button
                  onClick={() => setVisible(false)}
                  className="text-xs text-gray-500 hover:text-gray-700">
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default UnverifiedEmailPopup;
