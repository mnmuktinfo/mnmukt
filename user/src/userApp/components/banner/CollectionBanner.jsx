import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════
    GLOBAL STYLES (Luxury Edition)
══════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Barlow:wght@300;400;500;600;700&display=swap');

    .cb-root { font-family: 'Barlow', sans-serif; }
    .cb-display { font-family: 'Playfair Display', serif; }

    /* ── Cinematic Ken Burns ── */
    @keyframes cb-ken-burns {
      0%   { transform: scale(1); }
      100% { transform: scale(1.1); }
    }
    .cb-ken-burns-active {
      animation: cb-ken-burns 12s ease-out forwards;
    }

    /* ── Text Entrance ── */
    @keyframes cb-rise {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .cb-rise { animation: cb-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }

    /* ── Navigation Arrows ── */
    .cb-arrow {
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;
      z-index: 20;
    }
    .cb-arrow:hover {
      background: #da127d;
      color: white;
      transform: scale(1.1);
    }

    /* ── Progress Dots ── */
    .cb-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(0,0,0,0.1);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cb-dot.active {
      width: 32px; border-radius: 3px;
      background: #da127d;
    }

    .cb-marquee-inner {
      animation: cb-marquee-down 20s linear infinite;
    }
    @keyframes cb-marquee-down {
      0% { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `}</style>
);

const SLIDES = [
  {
    id: 0,
    label: "SS — 2026",
    tagline: ["LUXURY", "EMBROIDERY", "MEETS", "COMFORT"],
    taglineLayout: ["bold", "light", "light", "bold"],
    cta: "EXPLORE COLLECTION",
    href: "/collection/salwar-suits",
    mainImage:
      "https://images.biba.in/dw/image/v2/BKQK_PRD/on/demandware.static/-/Sites-biba-product-catalog/default/dw972146e7/images/ss26/skdblokbls32050ss26crm_1.jpg?sw=502&sh=753&q=100&strip=false",
    thumbs: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610030469618-9f3358079549?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590117591724-857140822da2?q=80&w=400&auto=format&fit=crop",
    ],
    bg: "#FAFAFA",
  },
  {
    id: 1,
    label: "AW — 2026",
    tagline: ["TIMELESS", "CLASSICS", "REIMAGINED"],
    taglineLayout: ["bold", "light", "bold"],
    cta: "SHOP THE LOOK",
    href: "/collection/festive",
    mainImage:
      "https://images.unsplash.com/photo-1617175548916-01b41c307204?q=80&w=800&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618886487325-f665032b6352?q=80&w=400&auto=format&fit=crop",
    ],
    bg: "#F9F5F6",
  },
];

const CollectionBanner = () => {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const slide = SLIDES[current];

  const goto = (idx) => {
    setCurrent((idx + SLIDES.length) % SLIDES.length);
    setAnimKey((k) => k + 1);
    setImgLoaded(false);
  };

  useEffect(() => {
    const timer = setInterval(() => goto(current + 1), 7000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <section className="cb-root relative w-full overflow-hidden selection:bg-[#da127d] selection:text-white">
      <Styles />

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT (md+)
      ══════════════════════════════════════════ */}
      <div
        className="hidden md:flex w-full h-[75vh] min-h-[600px] border-b border-gray-100"
        style={{ background: slide.bg }}>
        {/* Left Strip: Moving Label Marquee */}
        <div className="w-[60px] flex-shrink-0 border-r border-gray-100 flex items-stretch">
          <div className="overflow-hidden flex-1 relative">
            <div className="cb-marquee-inner flex flex-col items-center py-10 gap-20">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="cb-display text-[11px] font-bold tracking-[0.5em] text-gray-200 uppercase whitespace-nowrap"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}>
                  {slide.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Image Section */}
        <div className="relative w-[35%] overflow-hidden group">
          <img
            key={`img-${animKey}`}
            src={slide.mainImage}
            alt="Feature"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-1000 ${imgLoaded ? "cb-ken-burns-active" : ""}`}
          />
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Top Label */}
          <div className="absolute top-8 left-8 z-10">
            <span className="bg-white px-4 py-1.5 text-[10px] font-bold tracking-widest text-gray-900 uppercase">
              {slide.label}
            </span>
          </div>
        </div>

        {/* Center Content Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-16 text-center">
          <div key={`text-${animKey}`} className="mb-10">
            {slide.tagline.map((word, i) => (
              <div
                key={i}
                className="cb-rise"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <span
                  className={`cb-display block leading-none ${
                    slide.taglineLayout[i] === "bold"
                      ? "text-6xl lg:text-8xl font-black text-gray-900"
                      : "text-4xl lg:text-6xl font-light italic text-gray-400"
                  }`}>
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* Luxury Thumbnails */}
          <div className="flex gap-4 mb-12">
            {slide.thumbs.map((src, idx) => (
              <div
                key={`${animKey}-${idx}`}
                className="cb-rise relative w-20 h-28 lg:w-28 lg:h-36 overflow-hidden shadow-xl"
                style={{
                  animationDelay: `${0.4 + idx * 0.1}s`,
                  transform: idx === 1 ? "translateY(-12px)" : "",
                }}>
                <img
                  src={src}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  alt="Detail"
                />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate(slide.href)}
            className="cb-rise flex items-center gap-3 text-[12px] font-bold tracking-[0.3em] text-gray-900 hover:text-[#da127d] transition-colors uppercase group"
            style={{ animationDelay: "0.8s" }}>
            {slide.cta}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-2 transition-transform"
            />
          </button>
        </div>

        {/* Right Nav Controls */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <button
            onClick={() => goto(current - 1)}
            className="cb-arrow shadow-lg">
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goto(current + 1)}
            className="cb-arrow shadow-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-10 left-[40%] flex gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              className={`cb-dot ${i === current ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT (< md)
      ══════════════════════════════════════════ */}
      <div className="md:hidden w-full pb-12" style={{ background: slide.bg }}>
        <div className="relative w-full h-[50vh] overflow-hidden">
          <img
            key={`mob-img-${animKey}`}
            src={slide.mainImage}
            className="w-full h-full object-cover"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-6 left-6">
            <span className="text-white text-[10px] font-bold tracking-widest uppercase bg-[#da127d] px-3 py-1">
              {slide.label}
            </span>
          </div>
        </div>

        <div className="px-6 pt-10 text-center">
          <div key={`mob-text-${animKey}`} className="mb-8">
            {slide.tagline.map((word, i) => (
              <span
                key={i}
                className={`cb-display block ${
                  slide.taglineLayout[i] === "bold"
                    ? "text-4xl font-black"
                    : "text-3xl font-light italic text-gray-400"
                }`}>
                {word}
              </span>
            ))}
          </div>

          <button
            onClick={() => navigate(slide.href)}
            className="w-full bg-gray-900 text-white py-4 text-[12px] font-bold tracking-widest uppercase hover:bg-[#da127d] transition-colors">
            {slide.cta}
          </button>

          <div className="mt-8 flex justify-center gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goto(i)}
                className={`cb-dot ${i === current ? "active" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionBanner;
