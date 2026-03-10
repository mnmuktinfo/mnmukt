import { useState } from "react";
import { useNavigate } from "react-router-dom";

import StepSelectMethod from "../steps/StepSelectMethod";
import StepEmailForm from "../steps/StepEmailForm";
import StepDetailsForm from "../steps/StepDetailsForm";
import StepSuccess from "../steps/StepSuccess";

import { signupUser, googleSignup } from "../../firebase/firebaseauth";
import { IMAGES } from "../../../assets/images";
import { useAuth } from "../../context/AuthContext";

const SignupPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const isRegister = window.location.pathname.startsWith("/account/register");

  const [step, setStep] = useState(0);

  const [signupMethod, setSignupMethod] = useState("email");

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    password: "",
  });
  // console.log(
  //   "my email" + email,
  //   "my firstName" + userInfo.firstName,
  //   "my lastName" + userInfo.lastName,
  //   "my lastName" + userInfo.password,

  //   "my mobile" + mobile
  // );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------------
  // GOOGLE SIGNUP
  // ----------------------------------------------
  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setSignupMethod("google");
      setError("");

      const user = await googleSignup();

      // Save locally because Google is verified
      login(user.uid, {
        ...user,
        signupMethod: "google",
      });

      setStep(3); // Success step
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // ----------------------------------------------
  // EMAIL SIGNUP FINAL SUBMIT
  // ----------------------------------------------
  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setSignupMethod("email");
      setError("");

      const user = await signupUser({
        email,
        password: userInfo.password,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        mobile,
      });

      // Only move to success page
      setStep(3);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white md:rounded-t-3xl md:rounded-2xl relative shadow-2xl overflow-hidden w-full max-w-4xl md:flex md:h-auto">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black text-xl bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm md:bg-transparent md:shadow-none">
          ✕
        </button>

        {/* LEFT IMAGE */}
        <div className="hidden md:block w-1/2">
          <img
            src={IMAGES.signup_offer_banner}
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
          {/* LOGO
          <div className="flex justify-center mb-6 md:mb-8">
            <img src={IMAGES.logo} className="w-10 h-10 md:w-12 md:h-12" />
          </div> */}

          {/* ERRORS */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-lg">
              {error}
            </div>
          )}

          {step === 0 && (
            <StepSelectMethod
              setStep={setStep}
              setEmail={setEmail}
              email={email}
              setError={setError}
              onGoogleSignup={handleGoogleSignup}
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

          {step === 3 && <StepSuccess signupMethod={signupMethod} />}
        </div>
      </div>
    </div>
  );
};

export default SignupPopup;
