import React, { useState } from "react";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Phone,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Mail,
} from "lucide-react";

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        brand: "MNMUKT",
        createdAt: serverTimestamp(),
      });
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", orderId: "", message: "" });
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      {/* 1. TOP NAV BAR (Mnmukt Minimalist) */}
      <div className="bg-white border-b border-slate-50 px-6 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-slate-900 leading-none">
          Contact{" "}
          <span className="italic font-serif text-[#ff356c]">Concierge.</span>
        </h1>
        <p className="text-slate-400 text-sm uppercase tracking-[0.3em] font-bold mt-6">
          Excellence in assistance, 24/7
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-6">
        {/* 2. QUICK CONTACT TILES (Clean HUD Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 -mt-8 relative z-10">
          <a
            href="https://wa.me/919899990772"
            className="bg-white p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:border-[#ff356c]/30 transition-all">
            <div className="flex items-center gap-6">
              <div className="text-[#ff356c]">
                <MessageSquare size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-900">
                  Live Chat
                </p>
                <p className="text-xs text-slate-400">Response in 5 mins</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-200" />
          </a>

          <a
            href="tel:+919899990772"
            className="bg-white p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:border-[#ff356c]/30 transition-all">
            <div className="flex items-center gap-6">
              <div className="text-[#ff356c]">
                <Phone size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-900">
                  Direct Line
                </p>
                <p className="text-xs text-slate-400">9 AM - 6 PM IST</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-200" />
          </a>
        </div>

        {/* 3. THE FORM (Minimalist Manifest) */}
        <div className="mt-20">
          <div className="mb-12">
            <h2 className="text-[10px] uppercase tracking-[0.5em] font-black text-slate-300">
              Send Manifest
            </h2>
          </div>

          {status === "success" && (
            <div className="mb-10 p-4 border border-green-100 bg-green-50/50 text-green-700 text-[10px] uppercase tracking-widest font-bold flex items-center gap-3">
              <CheckCircle2 size={16} /> Message Dispatched Successfully
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="group relative">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
                Full Identity
              </label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border-b border-slate-100 py-4 text-lg bg-transparent focus:border-[#ff356c] focus:outline-none transition-all placeholder:text-slate-100"
                placeholder="Required"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="group relative">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-b border-slate-100 py-4 text-lg bg-transparent focus:border-[#ff356c] focus:outline-none transition-all placeholder:text-slate-100"
                  placeholder="name@example.com"
                />
              </div>
              <div className="group relative">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
                  Order Reference
                </label>
                <input
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleChange}
                  className="w-full border-b border-slate-100 py-4 text-lg bg-transparent focus:border-[#ff356c] focus:outline-none transition-all placeholder:text-slate-100"
                  placeholder="#MN-0000 (Optional)"
                />
              </div>
            </div>

            <div className="group relative">
              <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 group-focus-within:text-[#ff356c] transition-colors">
                Message Essence
              </label>
              <textarea
                name="message"
                required
                rows="3"
                value={formData.message}
                onChange={handleChange}
                className="w-full border-b border-slate-100 py-4 mt-2 text-lg bg-transparent focus:border-[#ff356c] focus:outline-none resize-none transition-all placeholder:text-slate-100"
                placeholder="Tell us how we may assist..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.5em] py-5 hover:bg-[#ff356c] transition-all disabled:opacity-30">
              {status === "loading" ? (
                <Loader2 className="animate-spin mx-auto w-5 h-5" />
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>

        {/* 4. ADDRESS & FOOTNOTE */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-50">
          <div>
            <h3 className="text-[10px] font-black text-slate-900 mb-6 uppercase tracking-[0.4em]">
              The Studio
            </h3>
            <div className="flex gap-4 items-start text-sm text-slate-500 font-light leading-relaxed">
              <MapPin size={18} className="text-[#ff356c] shrink-0" />
              <span>B 005, Sector 85, Noida, UP 201301</span>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-900 mb-6 uppercase tracking-[0.4em]">
              Hours
            </h3>
            <p className="text-sm text-slate-500 font-light tracking-wide italic font-serif">
              Mon — Sat: 09:00 — 18:00 IST
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUsPage;
