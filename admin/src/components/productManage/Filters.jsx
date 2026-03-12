import React from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { CATEGORIES } from "../../constants/categories";
import { COLLECTIONS } from "../../constants/collections";

const Filters = ({
  categoryFilter,
  setCategoryFilter,
  collectionFilter,
  setCollectionFilter,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm,
  clearFilters,
  hasActiveFilters,
}) => (
  <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
    <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-500" />
        <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Filter & Search
        </span>
      </div>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs font-bold text-[#2874F0] hover:underline flex items-center gap-1">
          <X size={12} /> Clear all
        </button>
      )}
    </div>

    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or brand…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-sm text-sm
            outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0]
            bg-white transition-all"
        />
      </div>

      {/* Category */}
      <div className="relative">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full appearance-none pl-4 pr-8 py-2.5 border border-gray-300
            rounded-sm text-sm bg-white outline-none cursor-pointer
            focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={14}
        />
      </div>

      {/* Collection */}
      <div className="relative">
        <select
          value={collectionFilter}
          onChange={(e) => setCollectionFilter(e.target.value)}
          className="w-full appearance-none pl-4 pr-8 py-2.5 border border-gray-300
            rounded-sm text-sm bg-white outline-none cursor-pointer
            focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all">
          <option value="all">All Collections</option>
          {COLLECTIONS.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={14}
        />
      </div>

      {/* Status */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full appearance-none pl-4 pr-8 py-2.5 border border-gray-300
            rounded-sm text-sm bg-white outline-none cursor-pointer
            focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all">
          <option value="all">All Status</option>
          <option value="active">Live Only</option>
          <option value="inactive">Drafts Only</option>
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={14}
        />
      </div>
    </div>
  </div>
);

export default Filters;
