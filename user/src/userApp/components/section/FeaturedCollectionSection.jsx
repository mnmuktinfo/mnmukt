import React, { useEffect, useState } from "react";
import { getFeaturedCollections } from "../../services/featuredService";
import { useNavigate } from "react-router-dom";

const FeaturedCollectionSection = ({ title = "Featured Collection" }) => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await getFeaturedCollections();
      setItems(data);
    };
    load();
  }, []);

  const large = items.filter((x) => x.size === "large");
  const small = items.filter((x) => x.size === "small");

  if (!items.length) return null;

  return (
    <section className="w-full px-4 md:px-12 py-16">
      {/* Title */}
      <h2 className="text-center text-3xl md:text-4xl font-semibold mb-12 tracking-wide">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT SIDE → Large Cards */}
        <div className="flex flex-col gap-6">
          {large.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/collection/${item.slug}`)}
              className="relative h-72 rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Text */}
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm opacity-80">Explore Collection →</p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE → Small Cards (3) */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {small.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/collection/${item.slug}`)}
              className="relative h-64 rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

              <div className="absolute bottom-3 left-3 text-white">
                <h4 className="text-lg font-medium">{item.title}</h4>
                <p className="text-sm opacity-80">Shop Now →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollectionSection;
