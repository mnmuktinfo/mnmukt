import React from "react";

/* ─────────────────────────────────────────────────────────
   DEFAULT PROMO ITEMS — edit freely
───────────────────────────────────────────────────────── */
const DEFAULT_ITEMS = [
  { message: "FREE SHIPPING ABOVE ₹1000/-" },
  { message: "Extra 5% OFF on prepaid orders" },
  { message: "Buy 2 Get 10% off" },
  { message: "Buy 3 Get 15% off" },
];

/* ─────────────────────────────────────────────────────────
   PROMO NAVBAR
   - Pure CSS marquee, right → left
   - 4 copies so the loop is seamless at any screen width
   - No JS timers, no layout jank
───────────────────────────────────────────────────────── */
const PromotionalNavbar = ({ items = DEFAULT_ITEMS, speed = 35 }) => {
  // 4 copies = gap-free loop even on very wide screens
  const looped = [...items, ...items, ...items, ...items];

  // Duration scales with item count so speed feels constant regardless of how many items
  const duration = `${items.length * speed}s`;

  return (
    <>
      <style>{`
        @keyframes tv-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .tv-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: tv-marquee ${duration} linear infinite;
          will-change: transform;
        }
        .tv-track:hover {
          animation-play-state: paused;
        }
        .tv-item {
          display: flex;
          align-items: center;
          gap: 0;
          white-space: nowrap;
          flex-shrink: 0;
        }
      `}</style>

      {/* Outer strip */}
      <div
        style={{
          background: "#e6007e",
          height: "38px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          width: "100%",
          userSelect: "none",
          position: "relative",
          zIndex: 50,
        }}
        aria-label="Promotional announcements"
        role="marquee">
        {/* Scrolling track */}
        <div className="tv-track" style={{ animationDuration: duration }}>
          {looped.map((item, i) => (
            <div key={i} className="tv-item">
              {/* Sparkle separator */}
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  lineHeight: 1,
                  padding: "0 18px",
                  opacity: 0.9,
                  flexShrink: 0,
                }}>
                ✦
              </span>

              {/* Message */}
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1,
                }}>
                {item.message}
              </span>

              {/* Optional link */}
              {item.linkText && (
                <a
                  href={item.linkUrl ?? "#"}
                  style={{
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "'DM Sans', sans-serif",
                    marginLeft: "6px",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                  }}>
                  {item.linkText}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PromotionalNavbar;
