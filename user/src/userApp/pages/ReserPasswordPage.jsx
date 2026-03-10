import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../config/firebase";
import { COLORS } from "../../style/theme";
import Notification from "../../shared/components/Notification";

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const oobCode = params.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Notification state
  const [toast, setToast] = useState({
    show: false,
    type: "info",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return showToast("error", "Passwords do not match.");
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);

      showToast("success", "Password reset successful! You can now log in.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      showToast("error", "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50 p-4">
      {/* Toast Notification */}
      {toast.show && (
        <Notification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
          duration={4000}
        />
      )}

      <div className="w-full max-w-md bg-white p-8 md:rounded-2xl md:shadow-lg">
        <h2 className="text-3xl font-[lora] text-[#ff356c] text-center mb-4">
          Reset Your Password
        </h2>

        <form className="space-y-5" onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: COLORS.secondary,
              "--tw-ring-color": COLORS.primary,
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: COLORS.secondary,
              "--tw-ring-color": COLORS.primary,
            }}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full py-3 bg-[#ff356c] rounded-lg text-white font-semibold transition">
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="text-sm text-center mt-4" style={{ color: COLORS.text }}>
          <Link
            to="/account/login"
            className="font-semibold"
            style={{ color: COLORS.primary }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
