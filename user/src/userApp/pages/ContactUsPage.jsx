import React, { useState } from "react";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  ArrowRight,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Check,
} from "lucide-react";

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    subject: "General Inquiry",
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
      setFormData({
        name: "",
        email: "",
        phone: "",
        orderId: "",
        subject: "General Inquiry",
        message: "",
      });
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#da127d] selection:text-white">
      {/* ── HEADER: Editorial Title ── */}
      <header className="w-full pt-20 pb-16 px-6 border-b border-gray-100 bg-[#FAFAFA]">
        <div className="max-w-[1500px] mx-auto text-center">
          <span className="text-[#da127d] text-[11px] font-bold uppercase tracking-[0.4em] mb-4 block">
            Bespoke Assistance
          </span>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl text-gray-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Connect with <span className="italic">Mnmukt</span>
          </h1>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto flex flex-col lg:flex-row border-l border-gray-100">
        {/* ── LEFT: The Inquiry Form ── */}
        <section className="flex-1 p-8 md:p-16 lg:p-20 border-r border-b lg:border-b-0 border-gray-100">
          <div className="max-w-xl">
            <h2
              className="text-2xl md:text-3xl text-gray-900 mb-10 tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Send <span className="italic">Inquiry</span>
            </h2>

            {status === "success" && (
              <div className="mb-10 bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3 text-emerald-700 text-[12px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                <Check size={18} /> Our concierge will contact you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Name */}
                <div className="group border-b border-gray-200 focus-within:border-[#da127d] transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[#da127d]">
                    Full Identity
                  </label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full py-3 text-[15px] bg-transparent outline-none placeholder:text-gray-200"
                    placeholder="Enter your name"
                  />
                </div>
                {/* Email */}
                <div className="group border-b border-gray-200 focus-within:border-[#da127d] transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[#da127d]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full py-3 text-[15px] bg-transparent outline-none placeholder:text-gray-200"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Order ID */}
                <div className="group border-b border-gray-200 focus-within:border-[#da127d] transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[#da127d]">
                    Order Reference
                  </label>
                  <input
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    className="w-full py-3 text-[15px] bg-transparent outline-none placeholder:text-gray-200"
                    placeholder="#MN-0000 (Optional)"
                  />
                </div>
                {/* Subject */}
                <div className="group border-b border-gray-200 focus-within:border-[#da127d] transition-colors">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[#da127d]">
                    Query Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full py-3 text-[15px] bg-transparent outline-none cursor-pointer">
                    <option>General Inquiry</option>
                    <option>Order Status</option>
                    <option>Custom Tailoring</option>
                    <option>Returns & Exchange</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="group border-b border-gray-200 focus-within:border-[#da127d] transition-colors">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-focus-within:text-[#da127d]">
                  Message Essence
                </label>
                <textarea
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full py-3 text-[15px] bg-transparent outline-none resize-none placeholder:text-gray-200"
                  placeholder="How may we assist your journey?"
                />
              </div>

              {/* Submit Button (Sharp Editorial) */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full md:w-auto bg-gray-900 text-white px-12 py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[#da127d] transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4">
                {status === "loading" ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    Send Query <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* ── RIGHT: Contact Info ── */}
        <aside className="lg:w-[400px] xl:w-[450px] bg-white p-8 md:p-16 lg:p-20 flex flex-col gap-16">
          {/* Studio Location */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <span className="text-[#da127d] text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block">
              The Atelier
            </span>
            <div className="flex gap-4 items-start">
              <MapPin
                size={20}
                strokeWidth={1.5}
                className="text-gray-400 shrink-0"
              />
              <div>
                <p className="text-[15px] text-gray-900 font-medium leading-relaxed">
                  B-005, Sector 85,
                  <br />
                  Noida, Uttar Pradesh 201305
                </p>
                <a
                  href="https://maps.google.com"
                  className="text-[11px] font-bold uppercase tracking-widest text-[#da127d] mt-4 block hover:underline">
                  Navigate
                </a>
              </div>
            </div>
          </div>

          {/* Digital Connection */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
            <span className="text-[#da127d] text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block">
              Digital Support
            </span>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group cursor-pointer">
                <Mail
                  size={20}
                  strokeWidth={1.5}
                  className="text-gray-400 group-hover:text-[#da127d] transition-colors"
                />
                <p className="text-[15px] text-gray-900 font-medium">
                  concierge@mnmukt.com
                </p>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <Phone
                  size={20}
                  strokeWidth={1.5}
                  className="text-gray-400 group-hover:text-[#da127d] transition-colors"
                />
                <p className="text-[15px] text-gray-900 font-medium">
                  +91 989 999 0772
                </p>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <span className="text-[#da127d] text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block">
              Timings
            </span>
            <div className="flex gap-4 items-start">
              <Clock size={20} strokeWidth={1.5} className="text-gray-400" />
              <p className="text-[14px] text-gray-600 italic font-serif leading-relaxed">
                Monday — Saturday
                <br />
                09:00 — 18:00 IST
              </p>
            </div>
          </div>

          {/* Social */}
          <div className="pt-8 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-[#da127d] transition-colors">
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                Follow our journey
              </span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ContactUsPage;
