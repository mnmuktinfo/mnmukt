import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Package,
  RefreshCw,
  ChevronDown,
  ArrowUpDown,
  ShoppingBag,
  TrendingDown,
  BarChart2,
  ExternalLink,
} from "lucide-react";

import { CATEGORIES } from "../../constants/categories";
import { COLLECTIONS } from "../../constants/collections";
import { productService } from "../../services/firebase/productService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPKR = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const getDiscount = (price, original) =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

// ─── Sub-components ───────────────────────────────────────────────────────────

const StockBadge = ({ stock }) => {
  if (stock === 0)
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs
        font-bold bg-red-100 text-red-700 border border-red-200">
        Out of Stock
      </span>
    );
  if (stock <= 10)
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs
        font-bold bg-amber-100 text-amber-700 border border-amber-200">
        Low — {stock} left
      </span>
    );
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs
      font-bold bg-green-100 text-green-700 border border-green-200">
      {stock} in stock
    </span>
  );
};

const StatusPill = ({ isActive }) =>
  isActive ? (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]
      font-bold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Live
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]
      font-bold bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Draft
    </span>
  );

const DeleteModal = ({ product, onConfirm, onCancel, deleting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4
    bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Delete Product?
            </h3>
            <p className="text-xs text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm mb-5">
          <p className="text-sm font-semibold text-gray-800 line-clamp-2">
            {product.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatPKR(product.price)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-sm text-sm
              font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-sm text-sm font-bold
              hover:bg-red-700 transition-colors disabled:opacity-50
              flex items-center justify-center gap-2">
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Deleting…
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white border border-gray-200 rounded-sm p-5 flex items-center gap-4 shadow-sm">
    <div
      className={`w-11 h-11 rounded-sm flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProductsManagementPage = () => {
  const navigate = useNavigate();

  // ── Filter state ─────────────────────────────────────────────────────────
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Product data ──────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Refs — avoid stale-closure / infinite-loop on pagination ─────────────
  // ✅ Using refs for pagination state prevents the loadProducts callback
  // from re-creating itself when lastDoc or loading changes — which would
  // cause useEffect to fire in an infinite loop.
  const lastDocRef = useRef(null);
  const loadingRef = useRef(false);
  const totalLoadedRef = useRef(0);

  // ── UI interaction state ──────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null); // product id

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Core load — reset=true clears list and starts from page 1 ────────────
  // ✅ Only filter values are deps — pagination refs don't cause re-renders
  const loadProducts = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return; // guard against double-calls

      loadingRef.current = true;
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);

      try {
        const result = await productService.getProducts({
          lastDoc: reset ? null : lastDocRef.current,
          category: categoryFilter,
          collectionType: collectionFilter,
          status: statusFilter,
        });

        setProducts((prev) =>
          reset ? result.products : [...prev, ...result.products],
        );

        lastDocRef.current = result.lastDoc;
        totalLoadedRef.current = reset
          ? result.products.length
          : totalLoadedRef.current + result.products.length;

        setHasMore(result.hasMore);
      } catch (err) {
        setError(err.message || "Failed to load products.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryFilter, collectionFilter, statusFilter],
  );

  // ── Re-fetch from scratch whenever filters change ─────────────────────────
  useEffect(() => {
    lastDocRef.current = null;
    loadProducts(true);
  }, [loadProducts]);

  // ── Client-side search (zero Firebase calls — filters loaded data) ────────
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q),
    );
  }, [products, searchTerm]);

  // ── Stats from loaded products ─────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    }),
    [products],
  );

  // ── Toggle visibility — 1 write, 0 reads ─────────────────────────────────
  const handleToggleVisibility = async (product) => {
    if (toggling) return;
    setToggling(product.id);
    try {
      await productService.updateProduct(product.id, {
        isActive: !product.isActive,
      });
      // Optimistic local update — no re-fetch needed
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !p.isActive } : p,
        ),
      );
      showToast(
        "success",
        `"${product.name}" is now ${!product.isActive ? "live on store" : "hidden"}.`,
      );
    } catch (err) {
      showToast("error", err.message || "Failed to update visibility.");
    } finally {
      setToggling(null);
    }
  };

  // ── Delete — 1 write, local state update (no re-fetch) ───────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast("success", `"${deleteTarget.name}" has been deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      showToast("error", err.message || "Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setCollectionFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters =
    categoryFilter !== "all" ||
    collectionFilter !== "all" ||
    statusFilter !== "all" ||
    searchTerm.trim() !== "";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-gray-900">
      {/* ── Slide-in toast ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5
            rounded-sm shadow-xl border text-sm font-bold max-w-xs
            ${
              toast.type === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          style={{ animation: "slideIn 0.22s ease-out" }}>
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          <span className="flex-1">{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            className="opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* ── Sticky top bar ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div
          className="max-w-[1500px] mx-auto px-4 sm:px-6 py-4
          flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2874F0] rounded-sm flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-tight">
                Products
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {totalLoadedRef.current} loaded · manage your store catalogue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Refresh */}
            <button
              onClick={() => loadProducts(true)}
              disabled={loading}
              title="Refresh list"
              className="p-2.5 rounded-sm border border-gray-200 bg-white hover:bg-gray-50
                text-gray-600 transition-colors disabled:opacity-40">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            {/* ✅ Add New Product button */}
            <button
              onClick={() => navigate("/admin/products/create")}
              className="flex items-center gap-2 bg-[#FB641B] text-white
                px-5 py-2.5 rounded-sm font-bold text-sm shadow-sm
                hover:bg-[#f4511e] active:scale-95 transition-all">
              <Plus size={16} />
              <span className="hidden sm:inline">Add New Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Loaded Products"
            value={stats.total}
            color="bg-[#2874F0]"
          />
          <StatCard
            icon={BarChart2}
            label="Live on Store"
            value={stats.active}
            color="bg-green-500"
          />
          <StatCard
            icon={TrendingDown}
            label="Low Stock"
            value={stats.lowStock}
            color="bg-amber-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Out of Stock"
            value={stats.outOfStock}
            color="bg-red-500"
          />
        </div>

        {/* ── Filters row ── */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
          <div
            className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60
            flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Filter & Search
              </span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#2874F0] hover:underline
                  flex items-center gap-1">
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
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 pointer-events-none"
              />
            </div>

            {/* Collection — uses COLLECTIONS[n].id to match collectionType in Firestore */}
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
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 pointer-events-none"
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
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Search scope note */}
          {searchTerm && (
            <div className="px-5 pb-3 -mt-1">
              <p
                className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200
                rounded-sm px-3 py-1.5 inline-flex items-center gap-1.5 font-semibold">
                <AlertCircle size={11} />
                Searching {products.length} loaded products.
                {hasMore && " Load more below to search further."}
              </p>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200
            rounded-sm text-red-700 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold">{error}</p>
              <button
                onClick={() => loadProducts(true)}
                className="text-xs text-red-600 underline mt-1 font-semibold">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Products table ── */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          {/* Desktop column headers */}
          <div
            className="hidden lg:grid
            grid-cols-[56px_1fr_155px_130px_110px_100px_120px]
            px-5 py-3 bg-gray-50 border-b border-gray-200 gap-4 items-center">
            {[
              { label: "" },
              { label: "Product" },
              {
                label: "Price",
                icon: <ArrowUpDown size={10} className="text-gray-400" />,
              },
              { label: "Stock" },
              { label: "Status" },
              { label: "Visibility" },
              { label: "Actions" },
            ].map(({ label, icon }, i) => (
              <div
                key={i}
                className="flex items-center gap-1
                text-[11px] font-black text-gray-500 uppercase tracking-widest">
                {label} {icon}
              </div>
            ))}
          </div>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="divide-y divide-gray-100">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-sm shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 rounded w-3/5" />
                    <div className="h-3 bg-gray-100 rounded w-2/5" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20 hidden lg:block" />
                  <div className="h-6 bg-gray-100 rounded w-24 hidden lg:block" />
                  <div className="h-6 bg-gray-100 rounded w-16 hidden lg:block" />
                </div>
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <Package size={52} className="mb-4 text-gray-200" />
              <p className="text-base font-bold text-gray-500 mb-1">
                No products found
              </p>
              <p className="text-sm text-gray-400">
                {hasActiveFilters
                  ? "No products match your current filters. Try clearing them."
                  : "Your catalogue is empty. Add your first product to get started."}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="mt-5 flex items-center gap-2 border-2 border-gray-300 text-gray-600
                    px-5 py-2.5 rounded-sm font-bold text-sm hover:bg-gray-50 transition-colors">
                  <X size={14} /> Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate("/admin/products/create")}
                  className="mt-5 flex items-center gap-2 bg-[#FB641B] text-white
                    px-6 py-2.5 rounded-sm font-bold text-sm hover:bg-[#f4511e] transition-colors">
                  <Plus size={15} /> Add First Product
                </button>
              )}
            </div>
          )}

          {/* ── Product rows ── */}
          {!loading && filteredProducts.length > 0 && (
            <div className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const disc = getDiscount(product.price, product.originalPrice);
                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-1 lg:grid-cols-[56px_1fr_155px_130px_110px_100px_120px]
                      gap-3 lg:gap-4 px-5 py-4 items-center hover:bg-blue-50/20 transition-colors">
                    {/* Thumbnail — desktop */}
                    <div
                      className="hidden lg:block w-14 h-14 rounded-sm overflow-hidden
                      border border-gray-100 bg-gray-100 shrink-0">
                      {product.banner ? (
                        <img
                          src={product.banner}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={18} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Product info — mobile stacks thumbnail + text */}
                    <div className="flex items-start gap-3 lg:contents">
                      {/* Thumbnail — mobile */}
                      <div
                        className="lg:hidden w-16 h-16 rounded-sm overflow-hidden
                        border border-gray-100 bg-gray-100 shrink-0">
                        {product.banner ? (
                          <img
                            src={product.banner}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={18} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Name + tags */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                          {product.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {product.categoryId &&
                            (() => {
                              const cat = CATEGORIES.find(
                                (c) => c.id === product.categoryId,
                              );
                              return cat ? (
                                <span
                                  className="text-[11px] text-[#2874F0] font-semibold
                                bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100">
                                  {cat.name}
                                </span>
                              ) : null;
                            })()}
                          {product.collectionType &&
                            (() => {
                              const col = COLLECTIONS.find(
                                (c) => c.id === product.collectionType,
                              );
                              return col ? (
                                <span
                                  className="text-[11px] text-purple-700 font-semibold
                                bg-purple-50 px-2 py-0.5 rounded-sm border border-purple-100">
                                  {col.name}
                                </span>
                              ) : null;
                            })()}
                          {product.sizes?.length > 0 && (
                            <span className="text-[11px] text-gray-500">
                              {product.sizes.slice(0, 4).join(" · ")}
                              {product.sizes.length > 4 && (
                                <span className="text-gray-400">
                                  {" "}
                                  +{product.sizes.length - 4}
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Mobile — inline stats + actions */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 lg:hidden">
                          <span className="text-sm font-black text-gray-900">
                            {formatPKR(product.price)}
                          </span>
                          {disc > 0 && (
                            <span
                              className="text-[11px] font-bold text-red-600
                              bg-red-50 px-1.5 py-0.5 rounded-sm">
                              -{disc}%
                            </span>
                          )}
                          <StockBadge stock={product.stock} />
                          <StatusPill isActive={product.isActive} />
                        </div>

                        <div className="flex items-center gap-2 mt-2.5 lg:hidden">
                          {/* ✅ Edit — mobile */}
                          <button
                            onClick={() =>
                              navigate(`/admin/products/edit/${product.id}`)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2874F0]
                              text-white rounded-sm text-xs font-bold hover:bg-blue-700 transition-colors">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(product)}
                            disabled={toggling === product.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300
                              rounded-sm text-xs font-bold text-gray-600 hover:bg-gray-100
                              transition-colors disabled:opacity-50">
                            {toggling === product.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : product.isActive ? (
                              <EyeOff size={12} />
                            ) : (
                              <Eye size={12} />
                            )}
                            {product.isActive ? "Hide" : "Show"}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 border border-gray-300 rounded-sm text-gray-400
                              hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Desktop columns ── */}

                    {/* Price */}
                    <div className="hidden lg:block">
                      <p className="text-sm font-black text-gray-900">
                        {formatPKR(product.price)}
                      </p>
                      {disc > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-400 line-through">
                            {formatPKR(product.originalPrice)}
                          </span>
                          <span
                            className="text-[11px] font-bold text-red-600
                            bg-red-50 px-1.5 py-0.5 rounded-sm">
                            -{disc}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="hidden lg:block">
                      <StockBadge stock={product.stock} />
                    </div>

                    {/* Status */}
                    <div className="hidden lg:block">
                      <StatusPill isActive={product.isActive} />
                    </div>

                    {/* Visibility toggle */}
                    <div className="hidden lg:flex items-center">
                      <button
                        onClick={() => handleToggleVisibility(product)}
                        disabled={toggling === product.id}
                        title={
                          product.isActive
                            ? "Click to hide from store"
                            : "Click to go live"
                        }
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs
                          font-bold border-2 transition-all disabled:opacity-50
                          ${
                            product.isActive
                              ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}>
                        {toggling === product.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : product.isActive ? (
                          <Eye size={13} />
                        ) : (
                          <EyeOff size={13} />
                        )}
                        {product.isActive ? "Live" : "Draft"}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-1.5">
                      {/* ✅ Edit — goes to ProductCreatePage in edit mode */}
                      <button
                        onClick={() =>
                          navigate(`/admin/products/edit/${product.id}`)
                        }
                        title="Edit product"
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#2874F0] text-white
                          rounded-sm text-xs font-bold hover:bg-blue-700 transition-colors">
                        <Edit2 size={13} />
                        Edit
                      </button>

                      {/* Preview on store */}
                      <a
                        href={`/product/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Preview on store"
                        className="p-2 rounded-sm border border-gray-200 text-gray-500
                          hover:bg-gray-100 hover:text-gray-800 transition-colors">
                        <ExternalLink size={13} />
                      </a>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(product)}
                        title="Delete product"
                        className="p-2 rounded-sm border border-gray-200 text-gray-400
                          hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination footer ── */}
          {!loading && filteredProducts.length > 0 && (
            <div
              className="border-t border-gray-100 px-5 py-4
              flex items-center justify-between bg-gray-50/40">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-bold text-gray-800">
                  {filteredProducts.length}
                </span>
                {searchTerm && ` of ${products.length} loaded`} products
                {!hasMore && (
                  <span className="text-gray-400"> · all loaded</span>
                )}
              </p>

              {hasMore ? (
                <button
                  onClick={() => loadProducts(false)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2 bg-white border-2
                    border-[#2874F0] text-[#2874F0] rounded-sm text-sm font-bold
                    hover:bg-blue-50 transition-colors disabled:opacity-50">
                  {loadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Loading
                      more…
                    </>
                  ) : (
                    "Load More Products"
                  )}
                </button>
              ) : (
                <span
                  className="text-xs font-bold text-green-700 bg-green-50
                  border border-green-200 px-3 py-1.5 rounded-sm
                  flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  All {products.length} products loaded
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProductsManagementPage;
