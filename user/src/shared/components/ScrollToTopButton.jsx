import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  // Show button after scroll
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    // Run once on mount in case the user refreshes halfway down the page
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      // We use CSS visibility/opacity instead of unmounting so it animates smoothly
      className={`fixed z-50 flex items-center justify-center 
                  bottom-25 left-4 sm:bottom-8 sm:left-8 
                  w-11 h-11 sm:w-12 sm:h-12 rounded-full 
                  bg-white/90 backdrop-blur-md text-[#da127d] 
                  border border-gray-100 shadow-lg 
                  transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
                  hover:bg-[#da127d] hover:text-white hover:shadow-xl hover:-translate-y-1 hover:border-[#da127d]
                  active:scale-95
                  ${
                    visible
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-8 pointer-events-none"
                  }`}>
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
};

export default React.memo(ScrollToTopButton);
