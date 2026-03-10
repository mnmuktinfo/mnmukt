import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Social Link Data
  const SOCIAL_LINKS = [
    {
      name: "Instagram",
      href: "https://instagram.com/mnmukt",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://facebook.com/mnmukt",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      href: "https://twitter.com/mnmukt",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12 font-sans">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          {/* Brand & Newsletter */}
          <div className="md:col-span-5 space-y-8 text-center md:text-left">
            <Link to="/" className="inline-block">
              <h2 className="text-3xl font-light tracking-tighter text-slate-900 leading-none">
                Mnmukt<span className="text-[#ff356c]">.</span>
              </h2>
            </Link>
            <p className="text-slate-500 text-lg leading-relaxed max-w-sm mx-auto md:mx-0 font-light">
              Redefining luxury through digital stillness. Crafted for the
              modern connoisseur.
            </p>

            <div className="pt-4 max-w-xs mx-auto md:mx-0">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-4 text-center md:text-left">
                Subscribe
              </p>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Email identity"
                  className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-[#ff356c] transition-all text-sm placeholder:text-slate-200"
                />
                <button className="absolute right-0 bottom-3 text-[#ff356c] font-black text-[10px] uppercase tracking-widest">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-6 hidden md:block">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-900">
              Explore
            </h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li>
                <Link
                  to="/new"
                  className="hover:text-[#ff356c] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/basics"
                  className="hover:text-[#ff356c] transition-colors">
                  Basics
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  className="hover:text-[#ff356c] transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2 space-y-6 hidden md:block">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-900">
              Support
            </h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-[#ff356c] transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className="hover:text-[#ff356c] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-[#ff356c] transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Icons & Redirects */}
          <div className="md:col-span-3 space-y-8 text-center md:text-left">
            <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-900">
              Connect
            </h4>
            <div className="flex justify-center md:justify-start gap-8">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#ff356c] transition-all duration-300 transform hover:-translate-y-1"
                  aria-label={social.name}>
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-50 md:border-none">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-300 mb-2">
                Concierge
              </p>
              <a
                href="mailto:concierge@mnmukt.com"
                className="text-slate-900 font-light hover:text-[#ff356c] transition-colors italic font-serif">
                concierge@mnmukt.com
              </a>
            </div>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="border-t border-slate-50 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-slate-300">
            &copy; {currentYear} MNMUKT LUXURY INTERFACES
          </p>
          <div className="flex gap-10">
            <Link
              to="/privacy"
              className="text-[9px] uppercase tracking-[0.3em] text-slate-300 hover:text-slate-900">
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-[9px] uppercase tracking-[0.3em] text-slate-300 hover:text-slate-900">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
