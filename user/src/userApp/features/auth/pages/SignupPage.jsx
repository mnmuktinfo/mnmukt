import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/UserContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signupUser, googleLogin, facebookLogin } = useAuth(); // ✅ googleLogin not googleSignup

  const [form, setForm] = useState({
    email: "",
    mobile: "",
    name: "",
    dateOfBirth: "", // ✅ was: age
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── Auto-redirect after signup success ── */
  useEffect(() => {
    let timer;
    if (step === 3) {
      // ✅ Redirect to email verification help, not homepage
      timer = setTimeout(() => navigate("/help/email-verification"), 3000);
    }
    return () => clearTimeout(timer);
  }, [step, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  /* ── Step 1 validation ── */
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.email || !form.mobile) {
      setError("Please fill in both email and mobile number.");
      return;
    }
    // Basic phone validation
    if (!/^\d{10}$/.test(form.mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setStep(2);
  };

  /* ── Step 2 final submit ── */
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (!form.dateOfBirth) return setError("Please enter your date of birth."); // ✅ was: age
    if (!form.gender) return setError("Please select your gender.");
    if (!form.password || form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");

    // ✅ Validate minimum age (13+)
    const dob = new Date(form.dateOfBirth);
    const age = Math.floor((Date.now() - dob) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) return setError("You must be at least 13 years old.");

    setLoading(true);
    setError("");
    try {
      await signupUser({
        email: form.email,
        password: form.password,
        name: form.name.trim(),
        phone: form.mobile,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth, // ✅ was: age: form.age
      });
      setStep(3);
    } catch (err) {
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Social login handlers ── */
  const handleGoogle = async () => {
    setSocialLoading(true);
    setError("");
    try {
      await googleLogin(); // ✅ was: googleSignup
      navigate("/");
    } catch (err) {
      setError(err?.message || "Google signup failed. Please try again."); // ✅ real error
    } finally {
      setSocialLoading(false);
    }
  };

  const handleFacebook = async () => {
    setSocialLoading(true);
    setError("");
    try {
      await facebookLogin();
      navigate("/");
    } catch (err) {
      setError(err?.message || "Facebook signup failed. Please try again."); // ✅ real error
    } finally {
      setSocialLoading(false);
    }
  };

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 sm:pt-20 px-6 font-sans">
      <div className="w-full max-w-[360px] flex flex-col items-center relative">
        {/* ── Back Button ── */}
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="absolute -top-2 -left-2 p-2 text-gray-400 hover:text-[#df0059] transition-colors bg-white rounded-full z-10"
            aria-label="Go back">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* ── Error Message ── */}
        {error && (
          <div className="w-full text-[#df0059] text-[13px] text-center font-medium bg-[#df0059]/5 py-2.5 rounded-[4px] border border-[#df0059]/20 mb-5">
            {error}
          </div>
        )}

        {/* ════════════════════════════════════════
            STEP 1 — Email + Mobile
        ════════════════════════════════════════ */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-2 tracking-wide text-center">
              Create an Account
            </h2>
            <p className="text-[13px] text-gray-500 text-center leading-[1.6] mb-8 px-2">
              Join us for your everyday shopping. Please enter your email and
              mobile number to start.
            </p>

            <form onSubmit={handleNextStep} className="w-full space-y-4">
              {/* Email */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M4 7.00005L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7" />
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-4 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
                />
              </div>

              {/* Mobile */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-4 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full h-[52px] mt-2 bg-[#df0059] hover:bg-[#c2004d] active:scale-[0.98] text-white text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all flex items-center justify-center shadow-md shadow-[#df0059]/20">
                Continue
              </button>
            </form>

            {/* Social */}
            <div className="w-full mt-8">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 relative">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={socialLoading}
                  className="w-full h-[48px] border border-gray-300 rounded-[4px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors active:scale-[0.98] disabled:opacity-50">
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="w-4 h-4"
                  />
                  <span className="text-[13px] font-medium text-gray-700">
                    Google
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleFacebook}
                  disabled={socialLoading}
                  className="w-full h-[48px] border border-gray-300 rounded-[4px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors active:scale-[0.98] disabled:opacity-50">
                  <img
                    src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                    alt="Facebook"
                    className="w-4 h-4"
                  />
                  <span className="text-[13px] font-medium text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>
            </div>

            <p className="text-[13px] text-gray-500 mt-8 text-center">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-semibold text-[#df0059] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════
            STEP 2 — Name, DOB, Gender, Password
        ════════════════════════════════════════ */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center pt-2">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-2 tracking-wide text-center">
              Complete Profile
            </h2>
            <p className="text-[13px] text-gray-500 text-center leading-[1.6] mb-8 px-2">
              Almost there! Complete your personal details to secure your
              account.
            </p>

            <form onSubmit={handleFinalSubmit} className="w-full space-y-4">
              {/* Full Name */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-4 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
                />
              </div>

              {/* Date of Birth + Gender Row */}
              <div className="flex gap-3">
                {/* ✅ Date of Birth — replaces age dropdown */}
                <div className="relative flex-1 group">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-semibold text-gray-400 group-focus-within:text-[#df0059] transition-colors z-10">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    max={
                      new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    } // max = 13 years ago
                    className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] px-3 text-[13px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all shadow-sm cursor-pointer"
                  />
                </div>

                {/* Gender */}
                <div className="relative flex-1 group">
                  <select
                    name="gender"
                    required
                    value={form.gender}
                    onChange={handleChange}
                    className={`w-full h-[52px] bg-white border border-gray-300 rounded-[4px] px-4 text-[14px] outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all appearance-none cursor-pointer shadow-sm ${form.gender ? "text-gray-800" : "text-gray-400"}`}>
                    <option value="" disabled>
                      Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password (min 6 characters)"
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-14 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-wide text-gray-400 hover:text-[#df0059] transition-colors p-1">
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#df0059] transition-colors pointer-events-none">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full h-[52px] bg-white border border-gray-300 rounded-[4px] pl-12 pr-4 text-[14px] text-gray-800 outline-none focus:border-[#df0059] focus:ring-1 focus:ring-[#df0059] transition-all placeholder:text-gray-400 shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] mt-2 bg-[#df0059] hover:bg-[#c2004d] active:scale-[0.98] text-white text-[13px] font-medium tracking-wider uppercase rounded-[4px] transition-all disabled:opacity-70 flex items-center justify-center shadow-md shadow-[#df0059]/20">
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════
            STEP 3 — Success
        ════════════════════════════════════════ */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center text-center mt-12">
            <div className="relative w-24 h-24 flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-[#df0059]/10 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-20 h-20 bg-[#df0059]/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-[#df0059]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-[24px] font-semibold text-gray-900 mb-3 tracking-wide">
              Account Created!
            </h2>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-2 px-4">
              Welcome aboard! Please verify your email address to activate your
              account.
            </p>
            {/* ✅ Show the email they signed up with */}
            <p className="text-[13px] font-semibold text-[#df0059] mb-8">
              Verification email sent to {form.email}
            </p>
            <span className="text-[13px] text-gray-400 animate-pulse block mb-6">
              Redirecting to verification page...
            </span>

            <button
              onClick={() => navigate("/help/email-verification")}
              className="w-full h-[52px] bg-white border-2 border-[#df0059] text-[#df0059] hover:bg-[#df0059] hover:text-white active:scale-[0.98] text-[13px] font-bold tracking-wider uppercase rounded-[4px] transition-all">
              Go to Verification Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
