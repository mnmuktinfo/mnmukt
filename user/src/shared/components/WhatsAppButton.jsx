import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { CONFIG } from "../../config/AppConfig";

const ActionButton = React.memo(({ onClick, icon, label, ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-gray-200 active:scale-[0.98] transition-all duration-200 group">
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-gray-700 text-sm sm:text-[15px]">
        {label}
      </span>
    </div>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-blue-600 group-hover:translate-x-0.5 transition-transform duration-200"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      />
    </svg>
  </button>
));

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);

  const instagram = useMemo(
    () => CONFIG.socials?.find((item) => item.name === "Instagram"),
    [],
  );

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeWidget();
      }
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

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, closeWidget]);

  useEffect(() => {
    document.body.style.overflow =
      isOpen && window.innerWidth < 768 ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleWhatsApp = useCallback(() => {
    const message = encodeURIComponent(
      CONFIG.support?.defaultMessage || "Hi, I need help.",
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
          onClick={closeWidget}
        />
      )}

      <div
        ref={widgetRef}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
        {isOpen && (
          <div
            className="
              mb-4
              w-[calc(100vw-2rem)]
              sm:w-[360px]
              max-w-[400px]
              rounded-2xl
              bg-white
              shadow-2xl
              overflow-hidden
              border
              border-gray-100
              animate-in
              slide-in-from-bottom-4
              fade-in
              duration-300
            ">
            <div className="bg-gradient-to-br from-[#4d9732] to-[#6db04d] p-6 relative">
              <button
                onClick={closeWidget}
                className="absolute top-4 right-4 p-1.5 text-white">
                ✕
              </button>

              <div className="pr-8">
                <h2 className="text-white text-2xl font-bold mb-1">
                  {CONFIG.widget?.greeting}
                </h2>

                <h3 className="text-white text-lg font-semibold mb-2">
                  {CONFIG.widget?.subtitle}
                </h3>

                <p className="text-white/90 text-sm">
                  {CONFIG.widget?.responseTime}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 space-y-2.5">
              {CONFIG.contact?.whatsappNumber && (
                <ActionButton
                  onClick={handleWhatsApp}
                  ariaLabel="WhatsApp"
                  label="Chat with us on WhatsApp"
                  icon={<div className="w-9 h-9 rounded-full bg-[#25D366]" />}
                />
              )}

              {instagram && (
                <ActionButton
                  onClick={handleInstagram}
                  ariaLabel="Instagram"
                  label="Chat with us on Instagram"
                  icon={
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" />
                  }
                />
              )}

              {CONFIG.contact?.email && (
                <ActionButton
                  onClick={handleEmail}
                  ariaLabel="Email"
                  label="Chat with us on Email"
                  icon={
                    <div className="w-9 h-9 rounded-full border border-gray-200" />
                  }
                />
              )}
            </div>

            <div className="text-center py-3 text-xs text-gray-500 bg-gray-50 border-t">
              Powered by{" "}
              <span className="font-semibold text-[#4d9732]">
                {CONFIG.BRAND_NAME}
              </span>
              ⚡
            </div>
          </div>
        )}

        <button
          onClick={toggleWidget}
          aria-expanded={isOpen}
          className={`
            w-14 h-14
            rounded-full
            flex items-center
            justify-center
            shadow-lg
            transition-all
            duration-300
            hover:scale-105
            ${isOpen ? "bg-[#3e8e23] rotate-90" : "bg-[#25D366]"}
          `}>
          💬
        </button>
      </div>
    </>
  );
};

export default React.memo(ChatWidget);
