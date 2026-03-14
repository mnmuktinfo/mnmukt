import React from "react";
import { useNavigate } from "react-router-dom";

// Image imports
const img1 =
  "https://res.cloudinary.com/mnmuk752221/image/upload/v1773426539/i4iv4ut711c1amvmydv2.jpg";
const img2 = "https://babli.in/cdn/shop/files/Co-ord_setds.jpg?v=1762331043";
const img3 =
  "https://babli.in/cdn/shop/files/Dresses_40350409-bed3-470e-b5ca-451176e8ca0d.jpg?v=1763456296";
const img4 =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop";
const img5 =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop";
const img6 =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=1200&fit=crop";

const ExploreOurPicks = () => {
  const navigate = useNavigate();

  // Array precisely ordered for the CSS Grid flow
  const products = [
    {
      id: 1,
      img: img1,
      label: "Festive Arrivals",
      link: "/collections/all",
      className: "col-span-2 md:col-span-1 row-span-2",
    },
    {
      id: 2,
      img: img2,
      label: "Co-ord Sets",
      link: "/collections/co-ord-set",
      className: "col-span-1 row-span-1",
    },
    {
      id: 3,
      img: img3,
      label: "Kurtas",
      link: "/collections/kurtas",
      className: "col-span-1 row-span-1",
    },
    {
      id: 4,
      img: img6,
      label: "Dresses",
      link: "/collections/dresses",
      className: "col-span-2 md:col-span-1 row-span-2",
    },
    {
      id: 5,
      img: img4,
      label: "Dupattas",
      link: "/collections/dupattas",
      className: "col-span-1 row-span-1",
    },
    {
      id: 6,
      img: img5,
      label: "Jackets",
      link: "/collections/jackets",
      className: "col-span-1 row-span-1",
    },
  ];

  return (
    // Beautiful soft background gradient that feels warm and boutique
    <section className="w-full bg-gradient-to-b from-[#FAFAFA] to-[#FFFBFB] py-16 md:py-24 font-sans border-t border-gray-100">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Elegant Typography Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[#da127d] uppercase tracking-[0.2em] text-xs font-semibold mb-3 block">
            Curated For You
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl text-gray-900 tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Explore Our Picks
          </h2>
        </div>

        {/* Responsive CSS Grid Container */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[250px] sm:auto-rows-[300px] lg:auto-rows-[360px] gap-3 md:gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(product.link)}
              className={`relative w-full h-full cursor-pointer overflow-hidden rounded-xl md:rounded-2xl group shadow-sm hover:shadow-2xl transition-all duration-500 ${product.className}`}>
              {/* Overlay to ensure text is always readable */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10"></div>

              {/* Main Image with slow cinematic zoom */}
              <img
                src={product.img}
                alt={product.label}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Frosted Glass Label Badge */}
              {product.label && (
                <div
                  className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 
                                bg-white/85 backdrop-blur-md border border-white/30 
                                text-gray-900 text-[11px] md:text-xs font-semibold uppercase tracking-wider 
                                px-6 py-2.5 rounded-sm shadow-lg whitespace-nowrap 
                                group-hover:bg-[#da127d] group-hover:text-white group-hover:border-[#da127d] 
                                transition-all duration-300">
                  {product.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreOurPicks;
