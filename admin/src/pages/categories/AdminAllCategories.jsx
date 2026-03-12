import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSync,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaImage,
} from "react-icons/fa";

import {
  fetchCategories,
  toggleCategoryStatus,
  deleteCategoryById,
} from "../../services/firebase/category/categoryApi";

export default function AdminCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // ----------------- FETCH CATEGORIES -----------------
  const loadCategories = async (reset = false) => {
    try {
      setLoading(true);
      const response = await fetchCategories(reset ? null : lastDoc);

      console.log("Categories fetched:", response.data);

      setCategories((prev) =>
        reset ? response.data : [...prev, ...response.data],
      );
      setLastDoc(response.lastDoc);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error("Fetch failed:", err);
      alert("Failed to load categories. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(true); // initial load
  }, []);

  // ----------------- ACTIONS -----------------
  const handleToggleStatus = async (id, current) => {
    try {
      setLoadingId(id);
      await toggleCategoryStatus(id, current);
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, isActive: !current } : cat,
        ),
      );
    } catch (err) {
      console.error("Toggle status failed:", err);
      alert("Failed to update status. Check console for details.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category permanently?",
      )
    )
      return;
    try {
      setLoadingId(id);
      await deleteCategoryById(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete category. Check console for details.");
    } finally {
      setLoadingId(null);
    }
  };

  // ----------------- FILTER -----------------
  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return categories.filter((cat) => {
      const matchSearch =
        cat.name?.toLowerCase().includes(search) ||
        cat.id.toLowerCase().includes(search);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? cat.isActive : !cat.isActive);
      return matchSearch && matchStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  // ----------------- SKELETON -----------------
  const SkeletonRow = () => (
    <div className="flex flex-col lg:grid lg:grid-cols-[70px_1fr_120px_120px_140px] gap-4 p-4 lg:px-6 lg:py-4 items-center border-b border-gray-100 animate-pulse">
      <div className="w-14 h-14 bg-gray-200 rounded-sm shrink-0"></div>
      <div className="flex-1 space-y-2 w-full lg:w-auto">
        <div className="h-4 bg-gray-200 w-1/3 rounded"></div>
        <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
      </div>
      <div className="hidden lg:block h-6 bg-gray-200 w-20 rounded-full"></div>
      <div className="hidden lg:block h-6 bg-gray-200 w-16 rounded-sm"></div>
      <div className="hidden lg:flex justify-end gap-2 w-full">
        <div className="h-8 w-8 bg-gray-200 rounded-sm"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-sm"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-sm"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] md:mt-5 pb-20 font-sans">
      {/* HEADER BAR */}
      <div className="bg-white border-b border-gray-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-[18px] font-medium text-[#212121]">
              Categories
            </h1>
            <p className="text-[12px] text-[#878787] hidden sm:block">
              Manage product groupings ({categories.length} loaded)
            </p>
          </div>

          <button
            onClick={() => navigate("/categories/create")}
            className="flex items-center justify-center gap-2 bg-[#2874F0] text-white px-5 py-2.5 rounded-sm font-medium text-[14px] shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] hover:bg-[#1c5fba] active:scale-95 transition-all min-w-[140px]">
            <FaPlus /> New Category
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* MAIN DATA CONTAINER */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
          {/* FILTER BAR */}
          <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-[#878787]" />
              </div>
              <input
                type="text"
                placeholder="Search categories by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#d7d7d7] rounded-sm text-[14px] focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 outline-none transition-all placeholder:text-[#878787]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 border border-[#d7d7d7] rounded-sm text-[14px] focus:border-[#2874F0] focus:ring-2 focus:ring-[#2874F0]/20 outline-none transition-all bg-white">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={() => loadCategories(true)}
              disabled={loading}
              title="Refresh Data"
              className="px-4 py-2 border border-[#d7d7d7] rounded-sm bg-white hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0">
              <FaSync
                className={
                  loading && categories.length > 0
                    ? "animate-spin text-[#2874F0]"
                    : ""
                }
              />
            </button>
          </div>

          {/* TABLE HEADER (Desktop) */}
          <div className="hidden lg:grid grid-cols-[70px_1fr_120px_120px_140px] gap-4 px-6 py-3.5 bg-[#f9fafb] border-b border-gray-200 text-[12px] font-semibold text-[#878787] uppercase tracking-wider items-center">
            <div>Image</div>
            <div>Category Details</div>
            <div>Status</div>
            <div>Products</div>
            <div className="text-right pr-2">Actions</div>
          </div>

          {/* TABLE BODY */}
          <div className="divide-y divide-gray-100">
            {loading && categories.length === 0 ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#f1f3f6] rounded-full flex items-center justify-center mb-4">
                  <FaSearch className="text-[#878787] text-2xl" />
                </div>
                <h3 className="text-[16px] font-medium text-[#212121] mb-1">
                  No Categories Found
                </h3>
                <p className="text-[13px] text-[#878787] max-w-sm">
                  Try adjusting your search criteria or add a new category to
                  see it here.
                </p>
              </div>
            ) : (
              filtered.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col lg:grid lg:grid-cols-[70px_1fr_120px_120px_140px] gap-4 p-4 lg:px-6 lg:py-4 items-center hover:bg-[#f8fafd] transition-colors group">
                  {/* Image & Mobile Header Wrapper */}
                  <div className="flex items-center gap-4 w-full lg:w-auto lg:contents">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-sm overflow-hidden border border-gray-200 bg-[#f1f3f6] shrink-0 flex items-center justify-center">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/100x100?text=No+Img")
                          }
                        />
                      ) : (
                        <FaImage className="text-[#c2c2c2] text-xl" />
                      )}
                    </div>

                    {/* Info (Desktop + Mobile) */}
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-[14px] font-medium text-[#212121] truncate group-hover:text-[#2874F0] transition-colors">
                        {cat.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-[#878787] font-mono bg-gray-100 px-1 py-0.5 rounded-sm">
                          ID: {cat.id}
                        </span>
                      </div>
                      {/* Mobile Only Extras */}
                      <div className="lg:hidden flex items-center gap-3 mt-2 text-[12px]">
                        <span
                          className={`px-2 py-0.5 rounded-sm border font-medium ${
                            cat.isActive
                              ? "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]"
                              : "bg-gray-100 text-[#878787] border-gray-200"
                          }`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[#878787]">
                          {cat.productCount || 0} Items
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status (Desktop) */}
                  <div className="hidden lg:block">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-sm border text-[12px] font-medium ${
                        cat.isActive
                          ? "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]"
                          : "bg-[#f1f3f6] text-[#878787] border-[#d7d7d7]"
                      }`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Products Count (Desktop) */}
                  <div className="hidden lg:block">
                    <span className="text-[13px] font-medium text-[#212121] bg-gray-100 px-2 py-1 rounded-sm border border-gray-200">
                      {cat.productCount || 0} Items
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:justify-end gap-2 mt-3 lg:mt-0 w-full lg:w-auto border-t border-gray-100 pt-3 lg:border-0 lg:pt-0">
                    <button
                      title="Edit Category"
                      disabled={loadingId === cat.id}
                      onClick={() => navigate(`/categories/edit/${cat.id}`)}
                      className="flex-1 lg:flex-none flex items-center justify-center p-2 text-[#878787] hover:text-[#2874F0] hover:bg-blue-50 rounded-sm transition-colors border border-transparent hover:border-blue-100 disabled:opacity-50">
                      <FaEdit size={16} />
                    </button>

                    <button
                      title={cat.isActive ? "Hide Category" : "Show Category"}
                      disabled={loadingId === cat.id}
                      onClick={() => handleToggleStatus(cat.id, cat.isActive)}
                      className="flex-1 lg:flex-none flex items-center justify-center p-2 text-[#878787] hover:text-[#f5a623] hover:bg-orange-50 rounded-sm transition-colors border border-transparent hover:border-orange-100 disabled:opacity-50">
                      {loadingId === cat.id ? (
                        <FaSync className="animate-spin" size={16} />
                      ) : cat.isActive ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </button>

                    <button
                      title="Delete Category"
                      disabled={loadingId === cat.id}
                      onClick={() => handleDelete(cat.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center p-2 text-[#878787] hover:text-[#c62828] hover:bg-red-50 rounded-sm transition-colors border border-transparent hover:border-red-100 disabled:opacity-50">
                      {loadingId === cat.id ? (
                        <FaSync className="animate-spin" size={16} />
                      ) : (
                        <FaTrash size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* LOAD MORE BUTTON */}
          {hasMore && !loading && (
            <div className="border-t border-gray-200 bg-[#f9fafb] p-4 flex justify-center">
              <button
                onClick={() => loadCategories(false)}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#d7d7d7] text-[#212121] text-[14px] font-medium rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors disabled:opacity-50 min-w-[200px]">
                {loading ? (
                  <FaSync className="animate-spin text-[#2874F0]" />
                ) : null}
                {loading ? "Loading..." : "Load More Categories"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
