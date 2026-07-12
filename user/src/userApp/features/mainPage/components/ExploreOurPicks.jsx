import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const ExploreOurPicks = () => {
  const navigate = useNavigate();

  const products = useMemo(
    () => [
      {
        id: 1,
        img: "https://babli.in/cdn/shop/files/Rang_Tie_dye.jpg?v=1762330104",
        label: "Festive Arrivals",
        link: "/collections/all",
      },
      {
        id: 2,
        img: "https://babli.in/cdn/shop/files/Co-ord_setds.jpg?v=1762331043",
        label: "Co-ord Set",
        link: "/collections/co-ord-set",
      },
      {
        id: 3,
        img: "https://babli.in/cdn/shop/files/Dresses_40350409-bed3-470e-b5ca-451176e8ca0d.jpg?v=1763456296",
        label: "Basic Shirts",
        link: "/collections/kurtas",
      },
      {
        id: 4,
        img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=1200&fit=crop",
        label: "Dresses",
        link: "/collections/dresses",
      },
      {
        id: 5,
        img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
        label: "Artsy",
        link: "/collections/artsy",
      },
      {
        id: 6,
        img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop",
        label: "Jackets",
        link: "/collections/jackets",
      },
      {
        id: 7,
        img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop",
        label: "Jackets",
        link: "/collections/jackets",
      },
    ],
    [],
  );
  const safeProducts = products.slice(0, 6);
  const Card = ({ item }) => (
    <div
      onClick={() => navigate(item.link)}
      className="relative w-full h-full cursor-pointer overflow-hidden  group bg-[#f8f8f8]">
      <img
        src={item.img}
        alt={item.label}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition" />

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white text-[#111] text-[11px] px-4 py-1.5 rounded shadow-sm">
        {item.label}
      </div>
    </div>
  );

  return (
    <section className="w-full bg-white py-10 md:py-14">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-[20px] md:text-[26px] font-medium text-[#1a1a1a]">
            Explore Our Picks
          </h2>
        </div>

        {/* PERFECT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[220px] md:auto-rows-[300px]">
          {/* LEFT BIG (1st) */}
          <div className="row-span-2 h-full">
            <Card item={safeProducts[0]} />
          </div>

          {/* CENTER TOP */}
          <Card item={safeProducts[1]} />
          <Card item={safeProducts[2]} />

          {/* RIGHT BIG (4th item) */}
          <div className="row-span-2 h-full">
            <Card item={safeProducts[3]} />
          </div>

          {/* CENTER BOTTOM */}
          <Card item={safeProducts[4]} />
          <Card item={safeProducts[5]} />
        </div>
      </div>
    </section>
  );
};

export default React.memo(ExploreOurPicks);
