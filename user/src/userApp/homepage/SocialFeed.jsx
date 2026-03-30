import React from "react";
import { CONFIG } from "../../config/AppConfig";

const SocialFeed = () => {
  const instagram = CONFIG.socials.find((s) => s.name === "Instagram");
  const whatsapp = CONFIG.socials.find((s) => s.name === "WhatsApp");

  // Replace these URLs with your actual image paths or dynamic feed
  const feedImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=800&auto=format&fit=crop",
      alt: "Woman in pink dress with car",
    },
    {
      id: 2,
      src: "https://babli.in/cdn/shop/files/IMG-20250722-WA0007.jpg?v=1762261590",
      alt: "Red bAbli dress package",
    },
    {
      id: 3,
      src: "https://babli.in/cdn/shop/files/IMG_20241207_182504_435.jpg?v=1762261589",
      alt: "bAbli promotional artwork",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=800&auto=format&fit=crop",
      alt: "Woman in pink dress with car",
    },
    {
      id: 5,
      src: "https://babli.in/cdn/shop/files/IMG-20250722-WA0007.jpg?v=1762261590",
      alt: "Red bAbli dress package",
    },
    {
      id: 6,
      src: "https://babli.in/cdn/shop/files/IMG_20241207_182504_435.jpg?v=1762261589",
      alt: "bAbli promotional artwork",
    },
  ];

  return (
    <>
      <section className="w-full py-16 md:py-24 bg-white border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 px-6">
            <h2 className="text-[16px] md:text-[18px] font-medium text-gray-900 tracking-wide">
              Love fashion? Follow{" "}
              {instagram?.url ? (
                <a
                  href={instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold hover:text-[#da127d] transition-colors">
                  @{instagram.name.toLowerCase()}
                </a>
              ) : (
                CONFIG.BRAND_NAME
              )}{" "}
              now!
            </h2>
          </div>

          {/* Image Grid / Scroller */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-3 md:gap-6 snap-x snap-mandatory px-4 md:px-0 pb-4 md:pb-0 scrollbar-hide">
            {feedImages.map((image) => (
              <a
                key={image.id}
                href={instagram?.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square w-[80vw] md:w-full shrink-0 snap-center overflow-hidden  bg-gray-100 block cursor-pointer">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Subtle overlay + Instagram logo */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default SocialFeed;
