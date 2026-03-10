import { useState } from "react";
import { auth, setupRecaptcha } from "../../config/firebase";
import { signInWithPhoneNumber } from "firebase/auth";

const PhoneAuth = () => {
  const [phone, setPhone] = useState("8392856993");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  console.log(phone);

  const sendOtp = async () => {
    const clean = phone.replace(/\s+/g, "");

    if (clean.length !== 10) {
      alert(clean.length);
      return;
    }

    try {
      const appVerifier = setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        "+91" + clean,
        appVerifier
      );

      setConfirmationResult(result);
      alert("OTP Sent!");
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const verifyOtp = async () => {
    try {
      await confirmationResult.confirm(otp);
      alert("Phone Verified Successfully!");
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <div>
      <h2>Phone Auth</h2>

      <div id="recaptcha-container"></div>

      <input
        type="text"
        placeholder="Phone (10 digits)"
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={sendOtp}>Send OTP</button>

      <input
        type="text"
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
      />

      <button onClick={verifyOtp}>Verify OTP</button>
    </div>
  );
};

export default PhoneAuth;
