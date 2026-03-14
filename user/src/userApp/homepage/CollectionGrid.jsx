import { Link } from "react-router-dom";
import { slugify } from "../../utils/slugify";

const CollectionGrid = ({ items = [], title }) => {
  // console.log(items);
  return (
    <section className="w-full bg-[#FAFAFA] py-16 md:py-24 font-sans">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* --- Premium Title Area --- */}
        {title && (
          <div className="text-center mb-12 md:mb-16">
            <h2
              style={{ fontFamily: "'Playfair Display', serif" }}
              className="text-3xl md:text-4xl lg:text-5xl text-gray-900 tracking-wide">
              {title}
            </h2>
            {/* Elegant pink divider line */}
            <div className="w-16 h-[1px] bg-[#da127d] mx-auto mt-6 opacity-50" />
          </div>
        )}

        {/* --- Spacious, Elegant Grid --- */}
        {/* Increased gap sizes so the collections don't feel crowded */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          {items.map((item, idx) => (
            <Link
              key={idx}
              to={`/collection/${slugify(item.name)}`}
              className="group flex flex-col items-center cursor-pointer transform transition-transform duration-500 hover:-translate-y-2">
              {/* --- Image Shell (Boutique Arch Style) --- */}
              <div className="w-full aspect-[3/4] overflow-hidden bg-[#F9F5F6] rounded-t-[100px] md:rounded-t-[120px] rounded-b-2xl shadow-sm group-hover:shadow-xl transition-all duration-500">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Soft warming overlay on hover */}
                <div className="absolute inset-0 bg-[#da127d]/0 group-hover:bg-[#da127d]/5 transition-colors duration-500" />
              </div>

              {/* --- Centered Label Area --- */}
              <div className="pt-6 pb-4 flex flex-col items-center text-center">
                <h3 className="text-[13px] md:text-[15px] font-medium text-gray-900 uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-[#da127d]">
                  {item.name}
                </h3>

                {/* Item count styled elegantly */}
                {item.count && (
                  <p className="text-[11px] md:text-[12px] text-gray-500 italic mt-2 font-serif">
                    {item.count} Exquisite Pieces
                  </p>
                )}

                {/* Expanding underline animation */}
                <div className="mt-3 h-[1px] w-0 bg-[#da127d] transition-all duration-500 ease-in-out group-hover:w-12" />
              </div>
            </Link>
          ))}
        </div>

        {/* --- Minimalist Empty State --- */}
        {items.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <span className="text-gray-300 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <p className="text-gray-500 text-[14px] tracking-widest uppercase">
              Curating new collections...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionGrid;
