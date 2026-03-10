import { Link } from "react-router-dom";
import { GoogleButton } from "../GoggleButton";

const StepSelectMethod = ({
  setStep,
  email,
  setEmail,
  setError,
  onGoogleSignup,
}) => {
  const handleEmailContinue = (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setStep(1);
  };

  return (
    <div className=" ">
      {/* Google Button Wrapper */}
      <div className="mb-10">
        <GoogleButton handleGoogle={onGoogleSignup} />
      </div>

      {/* Divider */}
      <div className="relative flex items-center mb-10">
        <div className="grow border-t border-slate-100"></div>
        <span className="shrink mx-4 text-[10px] uppercase tracking-[0.3em] text-slate-300">
          or use email
        </span>
        <div className="grow border-t border-slate-100"></div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailContinue} className="space-y-10">
        <div className="relative group">
          <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] text-lg transition-all placeholder:text-slate-100"
          />
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#ff356c] transition-colors shadow-2xl shadow-slate-100">
          Continue & Proceed
        </button>
      </form>

      {/* Terms Notice */}
      <p className="text-[10px] leading-relaxed text-slate-400 mt-10 text-center md:text-left">
        By proceeding, you agree to our{" "}
        <Link
          to="/terms"
          className="text-slate-900 font-bold hover:text-[#ff356c]">
          Terms
        </Link>
        ,{" "}
        <Link
          to="/privacy"
          className="text-slate-900 font-bold hover:text-[#ff356c]">
          Privacy
        </Link>
        , and{" "}
        <Link
          to="/cookies"
          className="text-slate-900 font-bold hover:text-[#ff356c]">
          Cookies
        </Link>
        .
      </p>
    </div>
  );
};

export default StepSelectMethod;
