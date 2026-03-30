import React, { useMemo } from "react";
import { CONFIG } from "../../config/AppConfig";

const CustomerSpotlight = () => {
  const photos = useMemo(
    () =>
      CONFIG?.ugcPhotos || [
        "https://judgeme.imgix.net/babli/1772878940__img20260218110605jpg__original.jpeg?auto=format&w=1024",
        "https://judgeme.imgix.net/babli/1772960703__14560aa9-d153-4241-8696-6b02b2bd327e__original.jpeg?auto=format&w=1024",
        "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop",
        "https://judgeme.imgix.net/babli/1771137507__1001065162__original.jpg?auto=format&w=1024",
        "https://judgeme.imgix.net/babli/1773417431__1773417423070-1000439858__original.jpg?auto=format&w=1024",
      ],
    [],
  );

  // ✅ cleaner stagger (no layout breaking)
  const getStaggerClass = (idx) => {
    return idx % 3 === 1
      ? "md:translate-y-6"
      : idx % 3 === 2
        ? "md:-translate-y-4"
        : "";
  };

  return (
    <section className="relative w-full py-14 md:py-20 bg-white border-b border-gray-100 overflow-hidden">
      {/* SOFT BACKGROUND TEXTURE */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#ffe4f1_0%,_transparent_60%)] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">
        {/* ── LEFT CONTENT ── */}
        <div className="w-full lg:w-1/3 text-center lg:text-left">
          {/* Tag */}
          <span className="text-[#da127d] uppercase tracking-[0.25em] text-[11px] font-medium block mb-3">
            Our Community
          </span>

          {/* Heading */}
          <h2 className="text-[22px] md:text-[28px] font-medium text-[#111] leading-tight">
            {CONFIG?.BRAND_NAME || "Mnmukt"} Ke Patake
          </h2>

          {/* Sub text */}
          <p className="mt-3 text-[13px] md:text-[14px] text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Real people. Real style. Real confidence. Discover how our community
            brings {CONFIG?.BRAND_NAME || "Mnmukt"} to life — from everyday
            elegance to statement moments.
          </p>

          {/* Extra detail line (NEW - makes it premium) */}
          <p className="mt-2 text-[12px] text-gray-500 max-w-sm mx-auto lg:mx-0">
            Every look tells a story — yours could be next.
          </p>

          {/* CTA */}
          <a
            href={CONFIG?.websiteURL || "/"}
            className="inline-block mt-6 px-7 py-3 text-[11px] uppercase tracking-[0.2em] border border-gray-300 text-black hover:bg-[#da127d] hover:text-white hover:border-[#da127d] transition-all duration-300">
            Explore Stories
          </a>
        </div>

        {/* ── RIGHT GRID ── */}
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {photos.map((photo, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-xl bg-white border border-gray-100 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${getStaggerClass(
                  idx,
                )}`}>
                {/* IMAGE */}
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={photo}
                    alt={`Customer ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* HOVER OVERLAY */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(CustomerSpotlight);
