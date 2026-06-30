import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  TruckIcon,
  CubeIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa"; // Keep these - Heroicons doesn't have brand icons

import { CONFIG } from "../../../config/AppConfig";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const year = new Date().getFullYear();

  const FOOTER_BG =
    "https://cdn.shopify.com/s/files/1/0840/2540/9814/files/Image_20260414_152720_313.png?v=1776160759";

  const PAYMENT_IMAGE =
    "https://cdn.shopify.com/s/files/1/0840/2540/9814/files/wrogn-com-cdn-shop-t-139-assets-payment_banner-svg-v-90671800364117800651721628885-09-01-2025_04_01_PM__1_-removebg-preview.png?v=1756724533";

  const socialIcons = {
    Facebook: FaFacebook,
    Instagram: FaInstagram,
    WhatsApp: FaWhatsapp,
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    // TODO: Add your newsletter API call here
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
    }, 1000);
  };

  const FooterSection = ({ title, children }) => (
    <div className="flex flex-col">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] mb-5 pb-3 border-b border-black/80 w-fit">
        {title}
      </h3>
      {children}
    </div>
  );

  const FooterLink = ({ to, children }) => (
    <Link
      to={to}
      className="text-[13px] text-gray-600 hover:text-[#da127d] transition-colors duration-200 py-1 block w-fit">
      {children}
    </Link>
  );

  return (
    <footer
      className="relative pt-16 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 md:px-12 text-black overflow-hidden"
      style={{
        backgroundImage: `url(${FOOTER_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      {/* White overlay with better contrast */}
      <div className="absolute inset-0 backdrop-blur-[1px]"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Contact */}
          <FooterSection title="Contact">
            <div className="space-y-3.5">
              <a
                href={CONFIG.contact.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="block text-[13px] text-gray-700 hover:text-[#da127d] transition-colors duration-200">
                <div className="font-medium">{CONFIG.contact.phoneDisplay}</div>
                <span className="text-[11px] text-gray-500">
                  {CONFIG.contact.phoneNote}
                </span>
              </a>

              <a
                href={`mailto:${CONFIG.contact.email}`}
                className="block text-[13px] text-gray-700 hover:text-[#da127d] transition-colors duration-200 break-all">
                {CONFIG.contact.email}
              </a>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                {CONFIG.contact.supportHours}
              </p>

              <p className="text-[10px] uppercase tracking-wider text-gray-400 pt-2 border-t border-gray-200">
                {CONFIG.BRAND_NAME}
              </p>
            </div>
          </FooterSection>

          {/* Quick Links */}
          <FooterSection title="Quick Links">
            <ul className="space-y-2.5">
              {CONFIG.quickLinks.map((item) => (
                <li key={item.label}>
                  <FooterLink to={item.path}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Policies */}
          <FooterSection title="Policies">
            <ul className="space-y-2.5">
              {CONFIG.policies.map((item) => (
                <li key={item.label}>
                  <FooterLink to={item.path}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <FooterSection title="Newsletter">
              <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">
                Subscribe for exclusive offers and early access to new
                collections.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="relative mb-6">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-b-2 border-gray-300 py-3 pr-10 text-[11px] font-semibold tracking-widest uppercase bg-transparent focus:outline-none focus:border-[#da127d] transition-colors duration-200 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Subscribe to newsletter"
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-[#da127d] disabled:opacity-50 transition-colors duration-200">
                  <ArrowRightIcon
                    className={`w-5 h-5 ${isSubmitting ? "animate-pulse" : ""}`}
                  />
                </button>
              </form>

              {/* Shipping Info - Now with Heroicons */}
              <div className="space-y-3 text-[11px] text-gray-600">
                <div className="flex items-start gap-2.5">
                  <TruckIcon className="w-4 h-4 text-[#da127d] flex-shrink-0 mt-0.5" />
                  <span>
                    Free Shipping Above {CONFIG.CURRENCY}
                    {CONFIG.shipping.freeShippingAbove}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CubeIcon className="w-4 h-4 text-[#da127d] flex-shrink-0 mt-0.5" />
                  <span>Delivery: {CONFIG.shipping.estimatedDelivery}</span>
                </div>

                {CONFIG.shipping.cashOnDelivery && (
                  <div className="flex items-start gap-2.5">
                    <BanknotesIcon className="w-4 h-4 text-[#da127d] flex-shrink-0 mt-0.5" />
                    <span>Cash On Delivery Available</span>
                  </div>
                )}
              </div>
            </FooterSection>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-7xl mx-auto mt-12 sm:mt-16 border-t border-gray-200 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
            {/* Social Icons */}
            <div className="flex gap-5 order-2 lg:order-1">
              {CONFIG.socials.map((social) => {
                const Icon = socialIcons[social.name];
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Follow us on ${social.name}`}
                    className="text-gray-500 hover:text-[#da127d] hover:-translate-y-0.5 transition-all duration-300 p-2 -m-2">
                    {Icon && <Icon size={20} />}
                  </a>
                );
              })}
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col items-center order-1 lg:order-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">
                Secure Payments
              </p>
              <img
                src={PAYMENT_IMAGE}
                alt="Accepted payment methods: Visa, Mastercard, UPI, and more"
                className="h-8 sm:h-10 md:h-12 object-contain opacity-90"
                loading="lazy"
              />
            </div>

            {/* Copyright */}
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 text-center order-3">
              © {year} {CONFIG.BRAND_NAME}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
