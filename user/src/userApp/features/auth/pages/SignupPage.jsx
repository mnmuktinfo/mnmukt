import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser, googleSignup } from "../../auth/services/authService";
import { useAuth } from "../../auth/context/UserContext";
import StepSelectMethod from "../components/steps/StepSelectMethod";
import StepEmailForm from "../components/steps/StepEmailForm";
import StepDetailsForm from "../components/steps/StepDetailsForm";
import StepSuccess from "../components/steps/StepSuccess";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(0);
  const [signupMethod, setSignupMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log(step);
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      setSignupMethod("google");
      const userData = await googleSignup();
      login(userData.uid, userData);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      setSignupMethod("email");
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
    <div className="min-h-screen flex items-center justify-center bg-white p-6 font-sans">
      <div className="w-full max-w-lg">
        {/* Step Indicator (Minimalist Dot Progress) */}
        {step < 3 && (
          <div className="flex gap-3 mb-12 justify-center md:justify-start">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 transition-all duration-300 ${
                  step >= i ? "w-8 bg-[#ff356c]" : "w-2 bg-slate-100"
                }`}
              />
            ))}
          </div>
        )}

        {/* Branding & Header */}
        {step < 3 && (
          <header className="mb-12 text-center md:text-left">
            <h1 className="text-5xl font-light tracking-tighter text-slate-900 leading-none mb-4">
              Join{" "}
              <span className="italic font-serif text-[#ff356c]">Mnmukt.</span>
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-[0.2em] font-bold">
              Step {step + 1} of 3
            </p>
          </header>
        )}

        {/* Global Error Display */}
        {error && (
          <div className="mb-8 text-[#ff356c] text-[10px] uppercase tracking-widest font-black text-center md:text-left">
            Error // {error}
          </div>
        )}

        {/* Rendered Steps */}
        <main className="relative">
          {step === 0 && (
            <StepSelectMethod
              setStep={setStep}
              setEmail={setEmail}
              email={email}
              setError={setError}
              onGoogleSignup={handleGoogleSignup}
              loading={loading}
            />
          )}

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

          {step === 2 && (
            <StepDetailsForm
              setStep={setStep}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              loading={loading}
              onSubmit={handleFinalSubmit}
            />
          )}

          {step === 3 && (
            <div className="fixed inset-0 bg-white z-50">
              <StepSuccess signupMethod={signupMethod} />
            </div>
          )}
        </main>

        {/* Footer / Login Link */}
        {step < 3 && (
          <footer className="mt-16 text-center md:text-left">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">
              Already a member?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#ff356c] font-black hover:underline underline-offset-4">
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
