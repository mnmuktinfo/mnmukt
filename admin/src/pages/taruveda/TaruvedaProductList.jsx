import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  PackageSearch,
} from "lucide-react";

import { productService } from "../../services/firebase/taruveda/taruveda";

export default function TaruvedaProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const itemsPerPage = 20;

  /* -------------------------------------------------- */
  /* FETCH INITIAL PRODUCTS */
  /* -------------------------------------------------- */

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await productService.getTaruvedaProducts();

      setProducts(result.products || []);
      setLastDoc(result.lastDoc || null);

      if ((result.products || []).length < itemsPerPage) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /* LOAD MORE PRODUCTS (FIRESTORE PAGINATION) */
  /* -------------------------------------------------- */

  const loadMoreProducts = async () => {
    if (!hasMore || !lastDoc) return;

    try {
      const result = await productService.getTaruvedaProducts(lastDoc);

      setProducts((prev) => [...prev, ...(result.products || [])]);
      setLastDoc(result.lastDoc || null);

      if ((result.products || []).length < itemsPerPage) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Load more failed:", err);
    }
  };

  /* -------------------------------------------------- */
  /* SEARCH DEBOUNCE */
  /* -------------------------------------------------- */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* -------------------------------------------------- */
  /* FILTER PRODUCTS */
  /* -------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;

    const lower = debouncedSearch.toLowerCase();

    return products.filter(
      (p) =>
        (p?.name || "").toLowerCase().includes(lower) ||
        (p?.category || "").toLowerCase().includes(lower),
    );
  }, [products, debouncedSearch]);

  /* -------------------------------------------------- */
  /* PAGINATION */
  /* -------------------------------------------------- */

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  /* -------------------------------------------------- */
  /* DELETE PRODUCT */
  /* -------------------------------------------------- */

  const handleDelete = async (productId, productName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
    );

    if (!confirmDelete) return;

    try {
      await productService.deleteTaruvedaProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product. Please try again.");
    }
  };

  /* -------------------------------------------------- */
  /* HELPER: SAFE IMAGE */
  /* -------------------------------------------------- */

  const getProductImage = (product) => {
    return (
      product?.image ||
      product?.images?.[0]?.url ||
      product?.images?.[0] ||
      null
    );
  };

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
            Active Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Managing {products.length} loaded products
          </p>
        </div>

        <Link
          to="/taruveda/products/new"
          className="bg-[#2874F0] text-white px-6 py-2.5 rounded-sm text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <Plus size={16} />
          ADD LISTING
        </Link>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="bg-white p-4 border border-gray-200 rounded-sm mb-4 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-sm focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] outline-none transition-all"
          />
        </div>
        {debouncedSearch && (
          <div className="text-[11px] font-bold text-gray-500 flex items-center bg-gray-50 px-3 py-1.5 rounded-sm border border-gray-200 uppercase tracking-wider">
            Found {filteredProducts.length} matches
          </div>
        )}
      </div>

      {/* --- DATA TABLE CONTAINER --- */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#2874F0] mb-3" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Fetching Inventory...
            </span>
          </div>
        ) : error ? (
          <div className="py-24 flex flex-col items-center justify-center text-red-500">
            <AlertCircle className="w-10 h-10 mb-3" />
            <span className="text-sm font-bold">{error}</span>
            <button
              onClick={fetchProducts}
              className="mt-4 text-xs font-bold text-[#2874F0] hover:underline uppercase tracking-wider">
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 text-center px-4">
            <PackageSearch className="w-12 h-12 mb-3 opacity-50" />
            <span className="text-sm font-bold text-gray-600">
              No products found
            </span>
            <span className="text-xs mt-1">
              Adjust your search or add a new listing to get started.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              {/* TABLE HEADER */}
              <thead>
                <tr className="bg-[#f1f3f6] text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4 font-bold w-[80px] text-center">
                    Image
                  </th>
                  <th className="px-6 py-4 font-bold">Product Name</th>
                  <th className="px-6 py-4 font-bold w-[180px]">Category</th>
                  <th className="px-6 py-4 font-bold w-[140px]">
                    Listing Price
                  </th>
                  <th className="px-6 py-4 font-bold w-[120px] text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedProducts.map((product) => {
                  const image = getProductImage(product);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50/40 transition-colors group">
                      {/* Image Column */}
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 mx-auto rounded-sm border border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </td>

                      {/* Name Column */}
                      <td className="px-6 py-3">
                        <p
                          className="font-semibold text-gray-900 truncate max-w-[300px]"
                          title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase">
                          ID: {product.id.substring(0, 8)}
                        </p>
                      </td>

                      {/* Category Column */}
                      <td className="px-6 py-3">
                        <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                          {product.category}
                        </span>
                      </td>

                      {/* Price Column */}
                      <td className="px-6 py-3 font-bold text-gray-900 text-base">
                        ₹{product.price}
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/taruveda/products/edit/${product.id}`}
                            className="p-2 text-gray-400 hover:text-[#2874F0] hover:bg-blue-50 rounded transition-colors"
                            title="Edit Product">
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* --- LOAD MORE FOOTER (Replaces old UI) --- */}
        {hasMore && !searchTerm && (
          <div className="border-t border-gray-200 bg-gray-50/50 p-4 flex justify-center">
            <button
              onClick={loadMoreProducts}
              disabled={loading}
              className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm hover:bg-gray-50 hover:text-[#2874F0] hover:border-[#2874F0] transition-all disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Loading..." : "Load More Products"}
            </button>
          </div>
        )}
      </div>

      {/* --- CLIENT-SIDE PAGINATION CONTROLS (Only shows if searching/filtering) --- */}
      {searchTerm && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-2 text-sm text-gray-500">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 border border-gray-300 rounded bg-white disabled:opacity-50 hover:bg-gray-50">
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border border-gray-300 rounded bg-white disabled:opacity-50 hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
