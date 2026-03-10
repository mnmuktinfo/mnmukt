import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaImage,
  FaTag,
  FaIndianRupeeSign,
  FaLink,
  FaCircleExclamation,
  FaPenNib,
} from "react-icons/fa6";
import { BiLoaderAlt } from "react-icons/bi";
import { useCategories } from "../hooks/useCategories";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const CategoryCreatePage = () => {
  const { id } = useParams(); // Detects if we are in "Edit Mode"
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { createCategory, updateCategory, loading, error, clearError } =
    useCategories();

  const [category, setCategory] = useState({
    name: "",
    image: "",
    price: "",
  });

  const [fetching, setFetching] = useState(isEditMode);
  const [notice, setNotice] = useState(null);

  // 1. Fetch data only if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCategoryData = async () => {
        try {
          const docRef = doc(db, "categories", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCategory(docSnap.data());
          } else {
            setNotice({
              type: "error",
              message: "Category not found in registry.",
            });
          }
        } catch (err) {
          setNotice({ type: "error", message: "Failed to fetch record." });
        } finally {
          setFetching(false);
        }
      };
      fetchCategoryData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (notice) setNotice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.name.trim() || !category.image.trim()) {
      setNotice({
        type: "error",
        message: "Name and Image URL are required protocols.",
      });
      return;
    }

    try {
      if (isEditMode) {
        // UPDATE PROTOCOL
        await updateCategory(id, category);
        setNotice({
          type: "success",
          message: "Registry Updated: Category Synchronized.",
        });
      } else {
        // CREATE PROTOCOL
        const slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        await createCategory({
          ...category,
          slug,
          price: category.price || "0",
        });
        setNotice({
          type: "success",
          message: "Registry Updated: Category Created.",
        });
      }

      setTimeout(() => navigate("/categories"), 1500);
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Registry Sync Failed.",
      });
    }
  };

  if (fetching) return <LoadingHUD message="Fetching Registry Entry..." />;

  return (
    <div className="h-screen bg-[#f8fafc] pb-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate("/categories")}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-all mb-8 text-xs font-bold uppercase tracking-widest group active:scale-95">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Registry
        </button>

        {/* Header HUD */}
        <div className="mb-10">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {isEditMode ? "Modify" : "Add New"}{" "}
            <span className="text-[#ff356c]">Category</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">
            {isEditMode
              ? `Editing Record: ${id}`
              : "Asset Identification & Catalog Entry"}
          </p>
        </div>

        {/* Alerts */}
        {(notice || error) && (
          <div
            className={`mb-6 p-4 rounded-sm border-l-4 flex items-center justify-between shadow-sm ${
              notice?.type === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                : "bg-rose-50 border-rose-500 text-rose-800"
            }`}>
            <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
              <FaCircleExclamation /> {notice?.message || error}
            </span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Field: Name */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FaTag className="text-[#ff356c]" /> Category Identity *
              </label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff356c] transition-all outline-none text-sm font-bold text-gray-900"
                placeholder="e.g. SUMMER DRESSES"
                required
              />
            </div>

            {/* Field: Image */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FaLink className="text-[#ff356c]" /> Resource URL *
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  name="image"
                  value={category.image}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff356c] transition-all outline-none text-sm font-bold text-gray-900"
                  placeholder="https://image-link.jpg"
                  required
                />
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaImage />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Field: Price */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FaIndianRupeeSign className="text-[#ff356c]" /> Entry Valuation
              </label>
              <div className="relative max-w-[180px]">
                <input
                  type="number"
                  name="price"
                  value={category.price}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff356c] transition-all outline-none text-sm font-bold text-gray-900 font-mono"
                  placeholder="0.00"
                />
                <FaIndianRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-8 py-6 flex gap-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/categories")}
              className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 active:scale-95">
              Abort
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-950 hover:bg-[#ff356c] text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-gray-400 shadow-md">
              {loading ? (
                <BiLoaderAlt className="animate-spin text-lg" />
              ) : (
                <>
                  {isEditMode ? <FaPenNib /> : <FaCheck />}{" "}
                  {isEditMode ? "Synchronize Changes" : "Authorize Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingHUD = ({ message }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <BiLoaderAlt className="animate-spin text-[#ff356c] mb-4" size={40} />
    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">
      {message}
    </p>
  </div>
);

export default CategoryCreatePage;
