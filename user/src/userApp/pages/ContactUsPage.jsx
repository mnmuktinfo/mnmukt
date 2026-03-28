import React, { useState } from "react";
import { db } from "../../config/firebaseAuth";
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
  MessageCircle,
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
      await addDoc(collection(db, "inquiries"), {
        ...formData,
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
    <div className="min-h-screen bg-white font-sans selection:bg-[#da127d] selection:text-white pb-20">
      {/* ── HEADER: Editorial Title ── */}
      <header className="w-full pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-[#da127d] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] mb-4 block">
            Customer Care
          </span>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-gray-900 font-light mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            We're Here for You
          </h1>
          <p className="text-gray-500 text-[14px] md:text-[15px] font-light leading-relaxed max-w-lg mx-auto">
            Whether you have a question about our collections, sizing, or an
            existing order, our dedicated concierge is ready to assist you.
          </p>
        </div>
      </header>

      {/* ── MAIN CONTENT: Split Layout ── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row border border-gray-100 rounded-sm overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.02)]">
          {/* ── LEFT: The Inquiry Form ── */}
          <section className="flex-[1.5] bg-white p-8 sm:p-12 lg:p-16">
            <h2
              className="text-2xl text-gray-900 mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Send an <span className="italic text-gray-600">Inquiry</span>
            </h2>

            {status === "success" && (
              <div className="mb-8 border-l-2 border-[#007673] bg-[#007673]/[0.03] p-4 flex items-start gap-3 text-[#007673] text-[13px] font-medium animate-in fade-in slide-in-from-top-2">
                <Check size={18} className="shrink-0 mt-0.5" />
                <p>
                  Thank you for reaching out. Our concierge team has received
                  your message and will contact you shortly.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="group relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 transition-colors group-focus-within:text-[#da127d]">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pb-2 text-[14px] text-gray-800 bg-transparent border-b border-gray-200 outline-none focus:border-[#da127d] transition-colors placeholder:text-gray-300"
                    placeholder="Jane Doe"
                  />
                </div>
                {/* Email */}
                <div className="group relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 transition-colors group-focus-within:text-[#da127d]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pb-2 text-[14px] text-gray-800 bg-transparent border-b border-gray-200 outline-none focus:border-[#da127d] transition-colors placeholder:text-gray-300"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Phone */}
                <div className="group relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 transition-colors group-focus-within:text-[#da127d]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pb-2 text-[14px] text-gray-800 bg-transparent border-b border-gray-200 outline-none focus:border-[#da127d] transition-colors placeholder:text-gray-300"
                    placeholder="+91 99999 99999"
                  />
                </div>
                {/* Order ID */}
                <div className="group relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 transition-colors group-focus-within:text-[#da127d]">
                    Order Reference
                  </label>
                  <input
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    className="w-full pb-2 text-[14px] text-gray-800 bg-transparent border-b border-gray-200 outline-none focus:border-[#da127d] transition-colors placeholder:text-gray-300"
                    placeholder="Optional (#MN-0000)"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="group relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 transition-colors group-focus-within:text-[#da127d]">
                  Query Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full pb-2 text-[14px] text-gray-800 bg-transparent border-b border-gray-200 outline-none focus:border-[#da127d] transition-colors cursor-pointer appearance-none rounded-none">
                  <option>General Inquiry</option>
                  <option>Order Status & Tracking</option>
                  <option>Custom Tailoring / Alterations</option>
                  <option>Returns & Exchange</option>
                </select>
              </div>

              {/* Message */}
              <div className="group relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 transition-colors group-focus-within:text-[#da127d]">
                  How can we help? *
                </label>
                <textarea
                  name="message"
                  required
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full pb-2 text-[14px] text-gray-800 bg-transparent border-b border-gray-200 outline-none focus:border-[#da127d] transition-colors resize-none placeholder:text-gray-300"
                  placeholder="Please share the details of your inquiry..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full sm:w-auto bg-[#1a1a1a] text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#da127d] transition-colors duration-500 disabled:opacity-70 flex items-center justify-center gap-3">
                  {status === "loading" ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      Send Message <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ── RIGHT: Contact Info ── */}
          <aside className="flex-1 bg-[#FAFAFA] p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100">
            <div className="space-y-12">
              {/* Studio Location */}
              <div>
                <span className="text-gray-900 text-[11px] font-bold uppercase tracking-widest mb-5 block flex items-center gap-2">
                  <MapPin size={14} className="text-[#da127d]" /> The Atelier
                </span>
                <p className="text-[14px] text-gray-600 leading-relaxed font-light">
                  B-005, Sector 85,
                  <br />
                  Noida, Uttar Pradesh 201305
                  <br />
                  India
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold uppercase tracking-widest text-[#da127d] mt-3 inline-block hover:underline underline-offset-4">
                  Get Directions
                </a>
              </div>

              {/* Digital Connection */}
              <div>
                <span className="text-gray-900 text-[11px] font-bold uppercase tracking-widest mb-5 block flex items-center gap-2">
                  <Phone size={14} className="text-[#da127d]" /> Get in Touch
                </span>
                <div className="space-y-4">
                  <a
                    href="mailto:concierge@mnmukt.com"
                    className="flex items-center gap-3 group">
                    <Mail
                      size={16}
                      strokeWidth={1.5}
                      className="text-gray-400 group-hover:text-[#da127d] transition-colors"
                    />
                    <span className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors font-light">
                      concierge@mnmukt.com
                    </span>
                  </a>
                  <a
                    href="tel:+919899990772"
                    className="flex items-center gap-3 group">
                    <Phone
                      size={16}
                      strokeWidth={1.5}
                      className="text-gray-400 group-hover:text-[#da127d] transition-colors"
                    />
                    <span className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors font-light">
                      +91 989 999 0772
                    </span>
                  </a>
                  <a
                    href="https://wa.me/919899990772"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 group">
                    <MessageCircle
                      size={16}
                      strokeWidth={1.5}
                      className="text-gray-400 group-hover:text-[#25D366] transition-colors"
                    />
                    <span className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors font-light">
                      WhatsApp Support
                    </span>
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <span className="text-gray-900 text-[11px] font-bold uppercase tracking-widest mb-4 block flex items-center gap-2">
                  <Clock size={14} className="text-[#da127d]" /> Business Hours
                </span>
                <p className="text-[14px] text-gray-600 leading-relaxed font-light">
                  Monday — Saturday
                  <br />
                  09:00 AM — 06:00 PM (IST)
                </p>
              </div>
            </div>

            {/* Social / Footer of Aside */}
            <div className="pt-12 mt-12 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Follow us
                </span>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#da127d] transition-colors">
                  <Instagram size={16} strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ContactUsPage;
