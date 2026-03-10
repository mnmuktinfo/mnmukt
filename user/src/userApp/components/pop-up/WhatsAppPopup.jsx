import React, { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaTimes, FaHeadset } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WhatsAppPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // WhatsApp Config
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";
  const message = encodeURIComponent("Namaste! I need help with my order.");
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* --- REVEALED BUTTONS (Show only when isOpen is true) --- */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 transform ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        }`}>
        {/* REDIRECT 1: CONTACT US PAGE */}
        <button
          onClick={() => {
            navigate("/contact-us");
            setIsOpen(false);
          }}
          className="flex items-center gap-3 bg-white text-gray-800 px-5 py-3 rounded-xl shadow-xl border border-gray-100 active:bg-gray-50">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            <FaEnvelope size={16} />
          </div>
          <span className="text-sm font-bold">Contact Us</span>
        </button>

        {/* REDIRECT 2: WHATSAPP */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white text-gray-800 px-5 py-3 rounded-xl shadow-xl border border-gray-100 active:bg-gray-50">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-[#25D366]">
            <FaWhatsapp size={20} />
          </div>
          <span className="text-sm font-bold">WhatsApp</span>
        </a>
      </div>

      {/* --- PRIMARY TRIGGER BUTTON --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-white text-gray-900 border border-gray-100 rotate-90"
            : "bg-[#232f3e] text-white"
        }`}>
        {isOpen ? <FaTimes size={20} /> : <FaHeadset size={24} />}
      </button>
    </div>
  );
};

export default WhatsAppPopup;
