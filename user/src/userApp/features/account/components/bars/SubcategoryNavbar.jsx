import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import CategoryMenuItem from "../../category/CategoryMenuItem"; // your component
import { useNavigate } from "react-router-dom";
import { FaHome, FaAngleDoubleRight } from "react-icons/fa";
import { api } from "../../../config";

const SubcategoryNavbar = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${api}/category/all`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();

    // Shadow effect on scroll
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setHoveredCategoryId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (category) => {
    setActiveCategory(category.name);
    setHoveredCategoryId(null);

    // Navigate directly if no subcategories
    if (!category.subcategories || category.subcategories.length === 0) {
      const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-");
      navigate(`/c/${categorySlug}?id=${category._id}`);
    }
  };

  const handleHover = (categoryId) => setHoveredCategoryId(categoryId);

  return (
    <div
      ref={menuRef}
      className={`sticky top-16 z-40 bg-gray-900 text-white transition-shadow duration-200 md:top-24 ${
        isScrolled ? "shadow-lg" : "shadow-md"
      }`}>
      <div className="max-w-7xl mx-auto flex items-center px-4 py-3">
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="flex-shrink-0 p-2 mr-3 bg-amber-600 hover:bg-amber-700 rounded-md"
          title="Home">
          <FaHome size={16} />
        </button>

        {/* Category Navbar */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <CategoryMenuItem
              key={category._id}
              category={category}
              activeCategory={activeCategory}
              onCategoryClick={handleCategoryClick}
              onHover={handleHover}
              isHovered={hoveredCategoryId === category._id}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="flex-shrink-0 flex items-center bg-gradient-to-l from-gray-900 to-transparent pl-4">
          <FaAngleDoubleRight className="text-gray-400 text-xl" />
        </div>
      </div>
    </div>
  );
};

export default SubcategoryNavbar;
