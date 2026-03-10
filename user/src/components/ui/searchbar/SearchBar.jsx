import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ searchTerm, setSearchTerm, handleSearch }) => {
  return (
    <div className="px-4 pb-2">
      <form onSubmit={handleSearch}>
        <div className="flex rounded-md border border-gray-300 shadow-sm overflow-hidden focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors duration-200">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white border-none focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-3 flex items-center justify-center hover:bg-green-700 transition-colors duration-200">
            <FaSearch size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
