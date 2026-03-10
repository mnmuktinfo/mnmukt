import React from "react";
import FilterSection from "../searchbar/FilterSection";

const SubcategoryFilterBar = ({
  category,
  selectedSubcategory,
  setSelectedSubcategory,
}) => {
  const handleClear = () => setSelectedSubcategory("all");

  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-wrap items-center gap-3 mb-6">
      <FilterSection title="Subcategories">
        <button
          onClick={() => setSelectedSubcategory("all")}
          className={`px-3 py-1 rounded-full border ${
            selectedSubcategory === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
          }`}>
          All
        </button>

        {category?.subcategories.map((subcat) => (
          <button
            key={subcat._id}
            onClick={() => setSelectedSubcategory(subcat._id)}
            className={`px-3 py-1 rounded-full border ${
              selectedSubcategory === subcat._id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}>
            {subcat.name}
          </button>
        ))}
      </FilterSection>

      <button
        onClick={handleClear}
        className="ml-auto bg-gray-100 text-gray-700 px-4 py-1 rounded-lg hover:bg-gray-200 transition">
        Clear
      </button>
    </div>
  );
};

export default SubcategoryFilterBar;
