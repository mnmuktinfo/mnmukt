import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signupUser,
  googleSignup,
  facebookLogin,
} from "../../auth/services/authService";
import StepSelectMethod from "../components/steps/StepSelectMethod";
import StepEmailForm from "../components/steps/StepEmailForm";
import StepDetailsForm from "../components/steps/StepDetailsForm";
import StepSuccess from "../components/steps/StepSuccess";

const SignupPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [signupMethod, setSignupMethod] = useState("email"); // "email" | "google" | "facebook"
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Google signup ───────────────────────────────────────── */
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      setSignupMethod("google");
      await googleSignup();
      setStep(3);
    } catch (err) {
      setError(err.message);
      setSignupMethod("email");
    } finally {
      setLoading(false);
    }
  };

  /* ── Facebook signup ─────────────────────────────────────── */
  const handleFacebookSignup = async () => {
    setLoading(true);
    setError("");
    try {
      setSignupMethod("facebook");
      await facebookLogin();
      setStep(3);
    } catch (err) {
      setError(err.message);
      setSignupMethod("email");
    } finally {
      setLoading(false);
    }
  };

  /* ── Email signup ────────────────────────────────────────── */
  const handleFinalSubmit = async () => {
    if (!userInfo.password || userInfo.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (userInfo.password !== userInfo.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await signupUser({
        email,
        password: userInfo.password,
        name: userInfo.name,
        phone: mobile,
      });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 pt-8 md:p-8 relative">
        {/* Step progress dots */}
        {step < 3 && (
          <div className="flex gap-2 mb-8 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= i ? "w-10 bg-[#f15757]" : "w-3 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Header */}
        {step < 3 && (
          <header className="mb-8 text-center">
            <h2 className="text-[22px] font-bold text-[#1f2937] mb-1">
              Create an Account
            </h2>
            <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">
              Step {step + 1} of 3
            </p>
          </header>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-[#f15757] text-[13px] font-medium p-3 rounded-sm mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Step 0 — select method */}
        {step === 0 && (
          <StepSelectMethod
            setStep={setStep}
            setEmail={setEmail}
            email={email}
            setError={setError}
            onGoogleSignup={handleGoogleSignup}
            onFacebookSignup={handleFacebookSignup}
            loading={loading}
          />
        )}

        {/* Step 1 — email + mobile */}
        {step === 1 && (
          <StepEmailForm
            email={email}
            setEmail={setEmail}
            mobile={mobile}
            setMobile={setMobile}
            setStep={setStep}
            setError={setError}
          />
        )}

        {/* Step 2 — name + password */}
        {step === 2 && (
          <StepDetailsForm
            setStep={setStep}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            loading={loading}
            onSubmit={handleFinalSubmit}
          />
        )}

        {/* Step 3 — success overlay */}
        {step === 3 && (
          <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <StepSuccess
              signupMethod={signupMethod}
              email={email}
              name={userInfo.name}
            />
          </div>
        )}

        {/* Footer */}
        {step < 3 && (
          <footer className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-[13px] text-gray-500">
              Already a member?{" "}
              <button
                onClick={() => navigate("/auth/login")}
                className="text-[#f15757] font-bold hover:underline transition-all">
                Sign In
              </button>
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
