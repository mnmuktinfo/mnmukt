import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

/* ══════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Barlow:wght@300;400;500;600;700&display=swap');

    .cb-root { font-family: 'Barlow', sans-serif; }
    .cb-display { font-family: 'Playfair Display', serif; }

    /* ── Image parallax ── */
    @keyframes cb-ken-burns {
      0%   { transform: scale(1) translate(0, 0); }
      100% { transform: scale(1.06) translate(-1%, -1%); }
    }
    .cb-ken-burns-active {
      animation: cb-ken-burns 8s ease-in-out forwards;
    }

    /* ── Stagger reveals ── */
    @keyframes cb-rise {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cb-fade {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes cb-slide-left {
      from { opacity: 0; transform: translateX(-20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes cb-slide-right {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes cb-scan {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    .cb-rise   { animation: cb-rise   0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .cb-fade   { animation: cb-fade   0.6s ease both; }
    .cb-left   { animation: cb-slide-left  0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .cb-right  { animation: cb-slide-right 0.7s cubic-bezier(0.22,1,0.36,1) both; }

    /* ── Thumb hover ── */
    .cb-thumb { overflow: hidden; cursor: pointer; }
    .cb-thumb img { transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
    .cb-thumb:hover img { transform: scale(1.08); }
    .cb-thumb::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.35) 100%);
      opacity: 0;
      transition: opacity 0.4s;
    }
    .cb-thumb:hover::after { opacity: 1; }

    /* ── Arrow button ── */
    .cb-arrow {
      position: relative;
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 50%;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(8px);
      cursor: pointer;
      transition: all 0.25s ease;
      z-index: 20;
    }
    .cb-arrow:hover {
      background: #111;
      border-color: #111;
      transform: scale(1.08);
    }
    .cb-arrow:hover svg { color: white; }
    .cb-arrow svg { color: #333; transition: color 0.2s; }

    /* ── CTA link ── */
    .cb-cta {
      position: relative;
      display: inline-flex; align-items: center; gap: 10px;
      text-decoration: none;
    }
    .cb-cta::after {
      content: '';
      position: absolute; left: 0; bottom: -3px;
      width: 0; height: 1.5px;
      background: #111;
      transition: width 0.4s cubic-bezier(0.22,1,0.36,1);
    }
    .cb-cta:hover::after { width: 100%; }
    .cb-cta:hover .cb-cta-arrow { transform: translateX(5px); }
    .cb-cta-arrow { transition: transform 0.3s ease; }

    /* ── Dot ── */
    .cb-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(0,0,0,0.2);
      border: none; cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }
    .cb-dot.active {
      width: 24px; border-radius: 3px;
      background: #111;
    }

    /* ── Vertical marquee text ── */
    @keyframes cb-marquee-down {
      0%   { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }
    .cb-marquee-inner {
      animation: cb-marquee-down 18s linear infinite;
    }

    /* ── Slide transition ── */
    .cb-slide-enter  { opacity: 0; transform: scale(1.03); }
    .cb-slide-active { opacity: 1; transform: scale(1); transition: opacity 0.6s ease, transform 0.6s ease; }
    .cb-slide-exit   { opacity: 0; transition: opacity 0.3s ease; }

    /* ── Mobile swipe hint ── */
    @keyframes cb-swipe-hint {
      0%   { transform: translateX(0); opacity: 0.6; }
      50%  { transform: translateX(8px); opacity: 1; }
      100% { transform: translateX(0); opacity: 0.6; }
    }
    .cb-swipe-hint { animation: cb-swipe-hint 2s ease-in-out 1.5s 3; }
  `}</style>
);

/* ══════════════════════════════════════════════════
   SLIDE DATA
══════════════════════════════════════════════════ */
const SLIDES = [
  {
    id: 0,
    label: "SS — 2025",
    tagline: ["SHIRTS", "THAT NEVER", "GO OUT", "OF STYLE"],
    taglineLayout: ["bold", "light", "light", "bold"],
    cta: "EXPLORE THE COLLECTION",
    href: "/collection/shirts",
    mainImage:
      "https://res.cloudinary.com/mnmuk752221/image/upload/v1773426497/pb731mi3q27sjafhvkto.jpg",
    thumbs: [
      "https://images.unsplash.com/photo-1550639524-a6f58345a278?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559582798-678dfc71ce5e?q=80&w=400&auto=format&fit=crop",
    ],
    accent: "#1a1a1a",
    bg: "#f2ede8",
  },
  {
    id: 1,
    label: "AW — 2025",
    tagline: ["LINEN", "CRAFTED FOR", "EVERY", "SEASON"],
    taglineLayout: ["bold", "light", "light", "bold"],
    cta: "SHOP LINEN RANGE",
    href: "/collection/linen",
    mainImage:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=400&auto=format&fit=crop",
    ],
    accent: "#6b5c4e",
    bg: "#ede8e2",
  },
  {
    id: 2,
    label: "SIGNATURE",
    tagline: ["CLASSICS", "REIMAGINED", "FOR THE", "MODERN EYE"],
    taglineLayout: ["bold", "light", "light", "bold"],
    cta: "VIEW SIGNATURE LINE",
    href: "/collection/signature",
    mainImage:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop",
    thumbs: [
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop",
    ],
    accent: "#3d3534",
    bg: "#eceae6",
  },
];

/* ══════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════ */
const CollectionBanner = () => {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const touchStartX = useRef(null);
  const autoplayRef = useRef(null);

  const slide = SLIDES[current];

  /* ── Helpers ── */
  const goto = (idx) => {
    const next = (idx + SLIDES.length) % SLIDES.length;
    setCurrent(next);
    setAnimKey((k) => k + 1);
    setImgLoaded(false);
  };
  const prev = () => goto(current - 1);
  const next = () => goto(current + 1);

  /* ── Autoplay ── */
  useEffect(() => {
    autoplayRef.current = setInterval(() => goto(current + 1), 6000);
    return () => clearInterval(autoplayRef.current);
  }, [current]);

  /* ── Touch swipe ── */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div
      className="cb-root relative w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}>
      <Styles />

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT (md+)
      ══════════════════════════════════════════ */}
      <div
        className="hidden md:flex w-full overflow-hidden"
        style={{
          height: "clamp(480px, 70vh, 720px)",
          background: slide.bg,
          transition: "background 0.8s ease",
        }}>
        {/* ── Vertical label strip ── */}
        <div
          className="w-[44px] flex-shrink-0 flex items-stretch border-r"
          style={{ borderColor: "rgba(0,0,0,0.07)" }}>
          <div className="overflow-hidden flex-1">
            <div className="cb-marquee-inner flex flex-col items-center py-6 gap-12 select-none">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="cb-display text-[10px] tracking-[0.4em] text-black/20 uppercase"
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

        {/* ── Main image ── */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: "clamp(220px, 30%, 380px)" }}>
          {/* Label overlay */}
          <div className="absolute top-5 left-4 z-10">
            <span
              className="cb-fade text-[10px] font-semibold tracking-[0.3em] text-white/80 uppercase bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full"
              style={{ animationDelay: "0.1s" }}
              key={`label-${animKey}`}>
              {slide.label}
            </span>
          </div>
          <img
            key={`img-${animKey}`}
            src={slide.mainImage}
            alt="Featured"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover object-top ${imgLoaded ? "cb-ken-burns-active" : ""}`}
          />
          {/* Vertical gradient fade into bg */}
          <div
            className="absolute inset-y-0 right-0 w-16 pointer-events-none"
            style={{
              background: `linear-gradient(to right, transparent, ${slide.bg})`,
            }}
          />
        </div>

        {/* ── Center content ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 xl:px-10 relative">
          {/* Tagline */}
          <div key={`text-${animKey}`} className="text-center mb-8 xl:mb-10">
            {slide.tagline.map((word, i) => (
              <div
                key={i}
                className="cb-rise overflow-hidden"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <span
                  className={`cb-display block leading-[1.05] tracking-[0.02em] ${
                    slide.taglineLayout[i] === "bold"
                      ? "font-black text-[clamp(28px,4.5vw,64px)] text-black"
                      : "font-light italic text-[clamp(22px,3.5vw,52px)] text-black/50"
                  }`}>
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* 3 Thumbnails */}
          <div className="flex gap-3 xl:gap-4 mb-8 xl:mb-10">
            {slide.thumbs.map((src, idx) => (
              <div
                key={`${animKey}-${idx}`}
                className="cb-thumb cb-rise relative rounded-sm overflow-hidden shadow-md"
                style={{
                  width: "clamp(72px, 8vw, 110px)",
                  height: "clamp(96px, 11vw, 148px)",
                  animationDelay: `${0.3 + idx * 0.1}s`,
                  transform: idx === 1 ? "translateY(-8px)" : "none",
                }}>
                <img
                  src={src}
                  alt={`Look ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={slide.href}
            className="cb-cta cb-rise text-[11px] font-semibold tracking-[0.22em] text-black uppercase"
            style={{ animationDelay: "0.55s" }}
            key={`cta-${animKey}`}>
            {slide.cta}
            <ArrowRight size={13} className="cb-cta-arrow" strokeWidth={2} />
          </a>

          {/* Dots */}
          <div className="absolute bottom-7 flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`cb-dot ${i === current ? "active" : ""}`}
                onClick={() => goto(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── Nav arrows ── */}
        <div className="absolute left-[44px] top-1/2 -translate-y-1/2 ml-3 z-20">
          <button className="cb-arrow" onClick={prev} aria-label="Previous">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <button className="cb-arrow" onClick={next} aria-label="Next">
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Slide counter ── */}
        <div className="absolute bottom-7 right-6 text-[11px] font-semibold tracking-widest text-black/25 select-none">
          0{current + 1}{" "}
          <span className="text-black/12">/ 0{SLIDES.length}</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT (< md)
      ══════════════════════════════════════════ */}
      <div
        className="md:hidden relative overflow-hidden"
        style={{ background: slide.bg, transition: "background 0.8s ease" }}>
        {/* Hero image — full bleed */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "65vw", minHeight: 240, maxHeight: 380 }}>
          <img
            key={`mob-img-${animKey}`}
            src={slide.mainImage}
            alt="Featured"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover object-top ${imgLoaded ? "cb-ken-burns-active" : ""}`}
          />
          {/* Dark gradient bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${slide.bg}, transparent)`,
            }}
          />

          {/* Season label */}
          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-semibold tracking-[0.3em] text-white/90 uppercase bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {slide.label}
            </span>
          </div>

          {/* Nav arrows on image */}
          <button
            className="cb-arrow absolute left-3 top-1/2 -translate-y-1/2"
            onClick={prev}
            style={{ width: 36, height: 36 }}>
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button
            className="cb-arrow absolute right-3 top-1/2 -translate-y-1/2"
            onClick={next}
            style={{ width: 36, height: 36 }}>
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Content below image */}
        <div className="px-5 pt-5 pb-8 flex flex-col items-center text-center">
          {/* Tagline */}
          <div className="mb-5" key={`mob-text-${animKey}`}>
            {slide.tagline.map((word, i) => (
              <span
                key={i}
                className={`cb-display ${
                  slide.taglineLayout[i] === "bold"
                    ? "font-black text-[clamp(22px,7vw,36px)] text-black"
                    : "font-light italic text-[clamp(18px,5.5vw,28px)] text-black/45"
                }`}>
                {word}
                {i < slide.tagline.length - 1 ? " " : ""}
              </span>
            ))}
          </div>

          {/* 3 thumbs */}
          <div className="flex gap-2.5 mb-6 justify-center">
            {slide.thumbs.map((src, idx) => (
              <div
                key={`${animKey}-mob-${idx}`}
                className="cb-thumb relative rounded overflow-hidden shadow"
                style={{
                  width: "22vw",
                  maxWidth: 88,
                  height: "30vw",
                  maxHeight: 120,
                  transform: idx === 1 ? "translateY(-6px)" : "none",
                }}>
                <img
                  src={src}
                  alt={`Look ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href={slide.href}
            className="cb-cta text-[10px] font-semibold tracking-[0.22em] text-black uppercase mb-6">
            {slide.cta}
            <ArrowRight size={12} className="cb-cta-arrow" strokeWidth={2} />
          </a>

          {/* Dots + counter */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold tracking-widest text-black/25">
              0{current + 1}
            </span>
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`cb-dot ${i === current ? "active" : ""}`}
                  onClick={() => goto(i)}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold tracking-widest text-black/20">
              0{SLIDES.length}
            </span>
          </div>

          {/* Swipe hint (shows once) */}
          <div className="mt-3 flex items-center gap-1.5 text-black/20 cb-swipe-hint">
            <span className="text-[9px] tracking-[0.2em] uppercase font-medium">
              Swipe
            </span>
            <ChevronRight size={10} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionBanner;
