import React from "react";
import { useNavigate } from "react-router-dom";

const LuxuryEthnicHero = () => {
  const navigate = useNavigate();

  // Replace with your high-res Biba or Salwar Suit image
  const heroImage =
    "https://images.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Sites-biba-product-catalog/default/dw972146e7/images/ss26/skdblokbls32050ss26crm_1.jpg?sw=502&sh=753&q=100&strip=false";

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row bg-white overflow-hidden font-sans selection:bg-[#da127d] selection:text-white">
      {/* ── LEFT: CONTENT BOX ── */}
      {/* On Mobile: Top of page. On Desktop: Centered and Spacious. */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 order-2 lg:order-1 bg-[#FAFAFA]">
        <div className="max-w-xl w-full text-center lg:text-left">
          {/* Top Kicker */}
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <span className="h-[1px] w-8 bg-[#da127d] hidden lg:block" />
            <p className="text-[#da127d] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em]">
              New Arrival • Summer 2026
            </p>
          </div>

          {/* Main Headline (Sharp & Big) */}
          <h1
            className="text-4xl md:text-6xl lg:text-8xl text-gray-900 leading-[1.1] mb-8 uppercase"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
            }}>
            The <br className="hidden md:block" />
            <span className="italic">Pure</span> Silk <br />
            Collection.
          </h1>

          {/* Descriptive Text (Sharp Gray) */}
          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-12 max-w-md mx-auto lg:mx-0 tracking-wide">
            Discover the artistry of hand-woven threads and intricate block
            prints. A celebration of heritage, tailored for the contemporary
            woman.
          </p>

          {/* Call to Action (Sharp Rectangle Buttons) */}
          <div className="flex flex-col sm:flex-row gap-0">
            <button
              onClick={() => navigate("/collections/new")}
              className="bg-gray-900 text-white px-10 py-5 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-[#da127d] transition-all duration-500 border border-gray-900 hover:border-[#da127d]">
              Explore Now
            </button>
            <button
              onClick={() => navigate("/collections/suits")}
              className="bg-white text-gray-900 px-10 py-5 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.3em] border border-gray-900 hover:text-[#da127d] hover:border-[#da127d] transition-all duration-500">
              View Lookbook
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: IMAGE BOX ── */}
      {/* Zero Rounded Corners. Fills the screen. */}
      <div className="flex-1 relative h-[60vh] lg:h-auto order-1 lg:order-2 group overflow-hidden">
        <img
          src={heroImage}
          alt="Premium Ethnic Suit"
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[2000ms] ease-out group-hover:scale-110"
        />

        {/* Editorial Frame (Inner Border Effect) */}
        <div className="absolute inset-4 border border-white/20 pointer-events-none" />

        {/* Price Tag Overlay (Sharp Square) */}
        <div className="absolute bottom-10 right-0 bg-white p-6 shadow-2xl hidden md:block group-hover:bg-[#da127d] group-hover:text-white transition-colors duration-500">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">
            Starting from
          </p>
          <p className="text-xl font-serif">₹ 4,999.00</p>
        </div>
      </div>
    </section>
  );
};

export default LuxuryEthnicHero;
