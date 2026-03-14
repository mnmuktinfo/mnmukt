import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, ArrowRight } from "lucide-react";

/* ─────────────────────────────────────────
   STYLES — Clean, minimal grayscale
───────────────────────────────────────── */
const Styles = () => (
  <style>{`
    .ft-link {
      color: #000000;
      font-size: 14px;
      transition: opacity 0.2s;
      text-decoration: none;
    }
    .ft-link:hover {
      opacity: 0.6;
    }
    .ft-input-line {
      border: none;
      border-bottom: 1px solid #000;
      padding: 8px 0;
      width: 100%;
      outline: none;
      font-size: 16px;
      color: #666;
      background: transparent;
    }
    .ft-input-line::placeholder {
      color: #999;
    }
    .whatsapp-float {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #25d366;
      color: white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  `}</style>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f3f3f3] pt-16 pb-10 px-6 md:px-12 font-sans text-black">
      <Styles />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
              Contact
            </h3>
            <div className="space-y-4">
              <a
                href="https://wa.me/919913419927"
                className="ft-link block underline">
                +91 9913419927 (Whatsapp Message Only)
              </a>
              <a
                href="mailto:support@babli.in"
                className="ft-link block underline">
                support@babli.in
              </a>
              <p className="text-sm mt-4">Official Name : bAbli</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                "About Us",
                "Contact Us",
                "Privacy Policy",
                "Terms of service",
                "Blogs",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(/ /g, "-")}`}
                    className="ft-link">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
              Policies
            </h3>
            <ul className="space-y-3">
              {[
                "FAQ",
                "Product Care",
                "Shipping Policy",
                "Exchange & Return Policy",
                "Exchange/Return Request",
                "Sitemap",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(/ /g, "-")}`}
                    className="ft-link">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
              Newsletter
            </h3>
            <p className="text-sm mb-6 leading-relaxed">
              Sign up to our newsletter to receive exclusive offers.
            </p>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="E-mail"
                className="ft-input-line"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <ArrowRight
                className="absolute right-0 cursor-pointer"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-20">
          <div className="flex gap-6 mb-6">
            <Facebook size={20} className="cursor-pointer hover:opacity-60" />
            <Instagram size={20} className="cursor-pointer hover:opacity-60" />
            {/* Custom WhatsApp Icon for social row */}
            <svg
              size={20}
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
              className="cursor-pointer hover:opacity-60">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <p className="text-[12px] text-gray-500">© {year} - bAbli</p>
        </div>
      </div>

      {/* Floating WhatsApp Button as seen in bottom right of image */}
      <a href="https://wa.me/919913419927" className="whatsapp-float">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </footer>
  );
};

export default Footer;
