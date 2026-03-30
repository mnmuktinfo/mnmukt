import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { BRAND_NAME, CONFIG } from "../../../config/AppConfig";
const Footer = () => {
  const [email, setEmail] = useState("");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 pt-20 pb-10 px-6 md:px-12 font-sans text-black selection:bg-[#da127d] selection:text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Column 1: Contact */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-black border-b border-black pb-3 inline-block">
            Contact
          </h3>
          <div className="space-y-4">
            <a
              href={CONFIG.contact.phoneLink}
              target="_blank"
              rel="noreferrer"
              className="block text-[13px] tracking-wide text-gray-500 hover:text-[#da127d] transition-colors">
              {CONFIG.contact.phoneDisplay} <br />
              <span className="text-[11px] text-gray-400">
                {CONFIG.contact.phoneNote}
              </span>
            </a>
            <a
              href={`mailto:${CONFIG.contact.email}`}
              className="block text-[13px] tracking-wide text-gray-500 hover:text-[#da127d] transition-colors">
              {CONFIG.contact.email}
            </a>
            <p className="text-[11px] tracking-widest uppercase mt-6 text-gray-400">
              Official Name: {BRAND_NAME}
            </p>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-black border-b border-black pb-3 inline-block">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {CONFIG.quickLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="text-[13px] tracking-wide text-gray-500 hover:text-[#da127d] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Policies */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-black border-b border-black pb-3 inline-block">
            Policies
          </h3>
          <ul className="space-y-3">
            {CONFIG.policies.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="text-[13px] tracking-wide text-gray-500 hover:text-[#da127d] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-black border-b border-black pb-3 inline-block">
            Newsletter
          </h3>
          <p className="text-[13px] tracking-wide mb-6 text-gray-500 leading-relaxed">
            Sign up to our newsletter to receive exclusive offers and early
            access to new collections.
          </p>
          <div className="relative w-full group">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 py-3 pr-10 text-[11px] font-bold tracking-widest uppercase text-black placeholder-gray-400 bg-transparent focus:outline-none focus:border-[#da127d] transition-colors"
            />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#da127d] hover:text-[#da127d] transition-colors"
              aria-label="Subscribe">
              <ArrowRightIcon className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-16 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Social Icons mapped from config */}
        <div className="flex gap-6 items-center">
          {CONFIG.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noreferrer"
              aria-label={social.name}
              className="text-gray-400 hover:text-[#da127d] transition-colors hover:-translate-y-1 transform duration-300">
              {social.icon}
            </a>
          ))}
        </div>

        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400">
          © {year} {BRAND_NAME}. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
