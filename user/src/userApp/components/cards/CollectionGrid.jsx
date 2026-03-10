import { Link } from "react-router-dom";
import { slugify } from "../../../utils/slugify";

const CollectionGrid = ({ items, title }) => {
  return (
    <div className="bg-[#fffbf4] px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold font-playfair">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {items.map((item, idx) => (
          <Link
            key={idx}
            to={`/collection/${slugify(item.name)}`}
            className="group block bg-white  overflow-hidden shadow-sm hover:shadow-md transition">
            {/* FIX: remove forced aspect ratio */}
            <div className="w-full h-auto overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-auto object-contain"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CollectionGrid;
