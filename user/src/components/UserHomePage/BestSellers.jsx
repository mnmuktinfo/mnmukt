import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import ItemCard from "../item/ItemCard";
import { api } from "../../config";

const BestSellers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Detect mobile screens
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(`${api}/item/best-sellers`);
        setItems(res.data.items || []);
      } catch (err) {
        console.error("Failed to fetch best sellers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <HashLoader size={50} color="#4f46e5" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className="text-gray-500 text-center mt-4">No best sellers found.</p>
    );
  }

  // Limit items for mobile (4) or show all on desktop
  const displayedItems = isMobile ? items.slice(0, 4) : items;

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Best Sellers</h2>

      {isMobile ? (
        <div className="grid grid-cols-2 gap-4">
          {displayedItems.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onDetailClick={() => handleDetailClick(item)}
            />
          ))}
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pb-3">
          {displayedItems.map((item) => (
            <div key={item._id} className="flex-shrink-0 w-60">
              <ItemCard
                item={item}
                onDetailClick={() => handleDetailClick(item)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSellers;
