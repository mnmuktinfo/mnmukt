import { Search } from "lucide-react";
import React from "react";

const SearchBar = ({ scrolled }) => {
  return (
    <div className="flex-1 flex justify-center">
      <div
        className={`w-[450px] h-10 rounded-full flex items-center px-4 gap-3 border transition-all
                ${
                  scrolled
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white/20 border-white/40 backdrop-blur-md"
                }
            `}>
        <Search
          size={20}
          className={`${scrolled ? "text-gray-500" : "text-white"}`}
        />
        <input
          type="text"
          placeholder="Search kurta, shirts and dupattas"
          className={`bg-transparent w-full outline-none text-sm
                ${
                  scrolled
                    ? "text-gray-800 placeholder-gray-500"
                    : "text-white placeholder-white/80"
                }
              `}
        />
      </div>
    </div>
  );
};

export default SearchBar;
