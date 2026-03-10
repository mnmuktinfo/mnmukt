import React, { useState } from "react";
import AccountNavbar from "../code/bars/AccountNavbar";

const SupportPage = () => {
  const [msg, setMsg] = useState("");

  const handleSubmit = () => {
    alert("Message sent! We will contact you soon.");
    setMsg("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountNavbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Support</h1>
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Describe your issue..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 h-32"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
