import React from "react";
import {
  Leaf,
  ArrowRight,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
} from "lucide-react";

export default function TaruvedaFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#112315] text-white pt-20 pb-10 border-t border-[#1a2e1f]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* 1. Brand & About (Takes up 4 columns on large screens) */}
          <div className="lg:col-span-4 md:pr-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#2C3E30] border border-[#3f5744] rounded-full flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-[#8CC63F]" strokeWidth={2} />
              </div>
              <div
                className="text-2xl font-bold tracking-wider text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                TARUVEDA
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm font-light">
              Organic hair and skin care rooted in authentic Ayurvedic wisdom.
              We believe in pure ingredients, sustainable practices, and honest
              results for your daily ritual.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#8CC63F] hover:text-[#112315] hover:border-[#8CC63F] transition-all duration-300"
                  aria-label="Social Link">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Shop Links (Takes up 2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8CC63F] mb-6">
              Shop
            </h3>
            <ul className="space-y-4">
              {[
                "Hair Care",
                "Skin Care",
                "Body Care",
                "Combos",
                "New Arrivals",
              ].map((link) => (
                <li key={link}>
                  <button className="text-gray-400 text-sm font-light hover:text-white hover:translate-x-1 transition-all duration-300 focus:outline-none">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Support & Company Links (Takes up 2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8CC63F] mb-6">
              Support
            </h3>
            <ul className="space-y-4">
              {[
                "About Us",
                "Track Order",
                "Returns & Refunds",
                "Contact Us",
                "Wholesale",
              ].map((link) => (
                <li key={link}>
                  <button className="text-gray-400 text-sm font-light hover:text-white hover:translate-x-1 transition-all duration-300 focus:outline-none">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Newsletter & Contact (Takes up 4 columns) */}
          <div className="lg:col-span-4 lg:pl-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8CC63F] mb-6">
              Join Our Collective
            </h3>
            <p className="text-gray-400 text-sm font-light mb-4 leading-relaxed">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>

            {/* Newsletter Input */}
            <form
              className="relative mb-8"
              onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-md py-3 pl-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8CC63F] focus:ring-1 focus:ring-[#8CC63F] transition-all"
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#8CC63F] rounded flex items-center justify-center text-[#112315] hover:bg-[#9fd94d] transition-colors focus:outline-none">
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </form>

            {/* Quick Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:hello@taruveda.com"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-light group">
                <Mail
                  size={16}
                  className="text-[#8CC63F] group-hover:scale-110 transition-transform"
                />
                hello@taruveda.com
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-light group">
                <Phone
                  size={16}
                  className="text-[#8CC63F] group-hover:scale-110 transition-transform"
                />
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-xs font-light tracking-wide text-center md:text-left">
            © {currentYear} TaruVeda Organic Farms. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            {["Privacy Policy", "Terms of Service", "Shipping Policy"].map(
              (l) => (
                <button
                  key={l}
                  className="text-gray-500 text-xs font-light hover:text-white transition-colors focus:outline-none">
                  {l}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
