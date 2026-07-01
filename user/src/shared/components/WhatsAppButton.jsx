import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { X, ChevronRight, Phone } from "lucide-react";
import { CONFIG } from "../../config/AppConfig";

// ── Icons ─────────────────────────────────────────────────────────────────
const WhatsAppIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-6 h-6"}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6 text-[#E1306C]">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const EmailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6 text-[#0284c7]">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

// ── Action Button Component ───────────────────────────────────────────────
const ActionButton = React.memo(
  ({ onClick, icon, title, subtitle, highlight = false }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group active:scale-[0.98] ${
        highlight
          ? "bg-green-50/50 border-green-100 hover:bg-green-50 shadow-sm"
          : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200 shadow-[0_2px_8px_rgb(0,0,0,0.02)]"
      }`}>
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center border bg-white ${highlight ? "border-green-200 shadow-sm" : "border-gray-100"}`}>
          {icon}
        </div>
        <div className="text-left">
          <p className="font-semibold text-gray-900 text-[14px]">{title}</p>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">
            {subtitle}
          </p>
        </div>
      </div>
      <ChevronRight
        className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${highlight ? "text-green-500" : "text-gray-400"}`}
      />
    </button>
  ),
);

// ── Main Widget ───────────────────────────────────────────────────────────
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const widgetRef = useRef(null);

  const instagram = useMemo(
    () => CONFIG.socials?.find((item) => item.name === "Instagram"),
    [],
  );

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => !prev);
    setShowTooltip(false); // Hide tooltip once clicked
  }, []);

  const closeWidget = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeWidget();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeWidget]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        closeWidget();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, closeWidget]);

  useEffect(() => {
    document.body.style.overflow =
      isOpen && window.innerWidth < 768 ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-hide tooltip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsApp = useCallback(() => {
    const message = encodeURIComponent(
      CONFIG.support?.defaultMessage || "Hi, I need help with an order.",
    );
    window.open(
      `https://wa.me/${CONFIG.contact?.whatsappNumber}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, []);

  const handleInstagram = useCallback(() => {
    if (instagram?.url) {
      window.open(instagram.url, "_blank", "noopener,noreferrer");
    }
  }, [instagram]);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent(
      CONFIG.support?.emailSubject || "Support Request",
    );
    window.location.href = `mailto:${CONFIG.contact?.email}?subject=${subject}`;
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 sm:hidden animate-in fade-in duration-200"
          onClick={closeWidget}
        />
      )}

      <div
        ref={widgetRef}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end font-sans">
        {/* Popup Menu */}
        {isOpen && (
          <div className="mb-4 w-[calc(100vw-2.5rem)] sm:w-[360px] max-w-[380px] rounded-2xl bg-white shadow-[0_12px_40px_rgb(0,0,0,0.12)] overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-200 origin-bottom-right">
            {/* Header */}
            <div className="bg-white p-5 pb-4 border-b border-gray-100 relative flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
              </div>
              <div className="pt-1">
                <h2 className="text-gray-900 text-[17px] font-bold leading-tight">
                  {CONFIG.widget?.greeting || "Need help? 👋"}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-gray-500 text-[12px] font-medium">
                    {CONFIG.widget?.responseTime ||
                      "Typically replies in minutes"}
                  </p>
                </div>
              </div>

              <button
                onClick={closeWidget}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-3 bg-[#faf9f8]">
              {CONFIG.contact?.whatsappNumber && (
                <ActionButton
                  onClick={handleWhatsApp}
                  title="Chat on WhatsApp"
                  subtitle="Fastest response time"
                  icon={<WhatsAppIcon className="w-6 h-6 text-[#25D366]" />}
                  highlight={true}
                />
              )}

              {instagram && (
                <ActionButton
                  onClick={handleInstagram}
                  title="Direct Message"
                  subtitle="Follow us on Instagram"
                  icon={<InstagramIcon />}
                />
              )}

              {CONFIG.contact?.email && (
                <ActionButton
                  onClick={handleEmail}
                  title="Send an Email"
                  subtitle="For detailed queries"
                  icon={<EmailIcon />}
                />
              )}
            </div>
          </div>
        )}

        {/* Floating Action Area */}
        <div className="relative flex items-center gap-4">
          {/* Tooltip Bubble */}
          {!isOpen && showTooltip && (
            <div className="hidden sm:block absolute right-full mr-4 bg-white text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg border border-gray-100 whitespace-nowrap animate-in slide-in-from-right-4 fade-in duration-500">
              Need help? 👋
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-100 rotate-45" />
            </div>
          )}

          {/* Main FAB */}
          <button
            onClick={toggleWidget}
            aria-expanded={isOpen}
            className={`
              relative flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-[0_8px_25px_rgb(37,211,102,0.35)] 
              transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-500/30
              ${isOpen ? "bg-gray-900 shadow-xl" : "bg-[#25D366] hover:bg-[#20bd5a]"}
            `}>
            {/* Subtle pulse ring behind the button when closed */}
            {!isOpen && (
              <span
                className="absolute w-full h-full rounded-full bg-[#25D366] opacity-30 animate-ping"
                style={{ animationDuration: "3s" }}
              />
            )}

            {isOpen ? (
              <X
                size={26}
                className="text-white transform transition-transform duration-300 rotate-90"
                strokeWidth={2.5}
              />
            ) : (
              <WhatsAppIcon className="w-8 h-8 text-white relative z-10" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default React.memo(ChatWidget);
