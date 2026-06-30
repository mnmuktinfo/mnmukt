import React, { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";

const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  // ✅ Show only once per user
  useEffect(() => {
    const hasSeen = localStorage.getItem("newsletter_seen");

    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  // ✅ Exit Intent (desktop only)
  useEffect(() => {
    const handleExit = (e) => {
      if (e.clientY < 10 && !localStorage.getItem("newsletter_seen")) {
        setIsOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleExit);
    return () => document.removeEventListener("mouseleave", handleExit);
  }, []);

  // ✅ ESC close
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const handleClose = () => {
    localStorage.setItem("newsletter_seen", "true");
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 👉 Replace with your backend / Firebase / API
    console.log("Subscribed:", email);

    localStorage.setItem("newsletter_seen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative flex flex-col md:flex-row w-full max-w-[850px] bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-[#da127d] text-gray-600 hover:text-white transition">
          <X size={18} />
        </button>

        {/* Image (Hidden on small screens for speed) */}
        <div className="hidden md:block w-1/2">
          <img
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c"
            alt="Fashion Collection"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <span className="text-[#da127d] text-xs font-bold tracking-widest uppercase mb-2">
            Exclusive Offer
          </span>

          <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
            Get <span className="text-[#da127d]">15% Off</span> Your First Order
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            Join our list for new drops, private deals & styling tips.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#da127d]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#da127d] hover:bg-[#b00e65] text-white py-3 rounded-md text-sm font-semibold tracking-wide transition">
              Unlock Discount
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
