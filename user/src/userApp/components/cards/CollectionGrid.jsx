import { Link } from "react-router-dom";
import { slugify } from "../../../utils/slugify";

const CollectionGrid = ({ items = [], title }) => {
  return (
    <div className="px-4 sm:px-6 py-10">
      {/* Title */}
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {title}
          </h2>
          <div className="w-10 h-0.5 bg-gray-200 mx-auto mt-3" />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={`/collection/${slugify(item.name)}`}
            className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200">
            {/* Image */}
            <div className="w-full aspect-[3/4] overflow-hidden bg-gray-50">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Label */}
            <div className="px-3 py-2.5">
              <p className="text-[13px] font-medium text-gray-800 truncate">
                {item.name}
              </p>
              {item.count && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {item.count} items
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-[13px]">
          No collections found.
        </div>
      )}
    </div>
  );
};

export default CollectionGrid;
