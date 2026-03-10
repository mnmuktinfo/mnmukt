import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../style/theme";

const AuthPopup = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user.n");
    if (!user) {
      // Show popup if user not logged in
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={() => setShow(false)}>
      <div
        className="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-lg text-center"
        onClick={(e) => e.stopPropagation()}>
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: COLORS.primary }}>
          You are not logged in
        </h2>
        <p className="mb-6" style={{ color: COLORS.text }}>
          Please login or signup to continue.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/account/login")}
            className="px-4 py-2 rounded-lg text-white font-semibold"
            style={{ background: COLORS.primary }}>
            Login
          </button>
          <button
            onClick={() => navigate("/account/signup")}
            className="px-4 py-2 rounded-lg text-gray-700 border border-gray-300 font-semibold">
            Signup
          </button>
        </div>
        <button
          onClick={() => setShow(false)}
          className="mt-4 text-sm text-gray-500 underline">
          Close
        </button>
      </div>
    </div>
  );
};

export default AuthPopup;
