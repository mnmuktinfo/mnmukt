import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";

const CollectionGrid = ({ items = [], title, subtitle }) => {
  return (
    <section className="w-full bg-[#fafafa] py-10 md:py-15">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* ── Header ── */}

        <div className="flex flex-col items-center text-center mb-5 md:mb-10">
          {title && (
            <h2 className="text-[20px] md:text-[25px] font-medium text-[#1a1a1a] tracking-[0.01em] leading-tight">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-[15px] md:text-[17px] text-[#2b2a2a] font-normal tracking-[0.02em]">
              {subtitle}
            </p>
          )}
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14">
          {items.map((item, idx) => (
            <Link
              key={idx}
              to={`/collections/${slugify(item.name)}`}
              className="group block">
              {/* Image */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* subtle overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-500" />
              </div>

              {/* Info */}
              <div className="pt-4 text-center">
                <h3 className="text-[13px] md:text-[14px] font-medium text-[#111] uppercase tracking-[0.12em] group-hover:opacity-70 transition">
                  {item.name}
                </h3>

                {item.count && (
                  <p className="text-[11px] text-[#6b6b6b] mt-1">
                    {item.count} items
                  </p>
                )}

                {/* underline */}
                <div className="mt-2 h-[1px] w-0 bg-black mx-auto group-hover:w-8 transition-all duration-400" />
              </div>
            </Link>
          ))}
        </div>

        {/* Empty */}
        {items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6b6b6b] text-[14px]">
              Curating new collections...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionGrid;
