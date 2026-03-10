import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ItemCard from "./item/ItemCard";

const RecommendationSection = ({ typeItem, currentItemId }) => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Detect mobile screens
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter out the current item
  const filteredItems = typeItem.filter((item) => item._id !== currentItemId);
  if (!filteredItems.length) return null;

  const handleDetailClick = (item) => {
    const nameSlug = item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const categorySlug = item.category?.name
      ? item.category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "all";
    const subcategorySlug = item.subcategory
      ? item.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "all";

    navigate(
      `/item/${item._id}/${nameSlug}/${categorySlug}/${subcategorySlug}`
    );
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Recommended for You
        </h2>
        <button className="text-blue-500 hover:text-blue-700 font-medium flex items-center">
          View all
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isMobile ? (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onDetailClick={() => handleDetailClick(item)}
            />
          ))}
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pb-3">
          {filteredItems.map((item) => (
            <div key={item._id} className="flex-shrink-0 w-60">
              <ItemCard
                item={item}
                onDetailClick={() => handleDetailClick(item)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecommendationSection;
