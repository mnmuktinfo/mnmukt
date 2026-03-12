import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Package,
  BarChart2,
  TrendingDown,
  AlertCircle,
  Plus,
  Info,
  X,
} from "lucide-react";

import Filters from "../../components/productManage/Filters";
import StatCard from "../../components/productManage/StatCard";
import ProductTable from "../../components/productManage/ProductTable";
import DeleteModal from "../../components/productManage/DeleteModal";
import Toast from "../../components/productManage/Toast";

import { productService } from "../../services/firebase/product/productService";

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatPKR = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const getDiscount = (price, original) =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProductsManagementPage = () => {
  const navigate = useNavigate();

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Product data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Pagination refs
  const lastDocRef = useRef(null);
  const loadingRef = useRef(false);

  // UI state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = useCallback((type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ─── Load products from Firebase ─────────────────────────────
  const loadProducts = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
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

  useEffect(() => {
    lastDocRef.current = null;
    loadProducts(true);
  }, [loadProducts]);

  // ─── Client-side search/filter ──────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;
      const matchesCollection =
        collectionFilter === "all" ||
        product.collectionType === collectionFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? product.isActive : !product.isActive);
      return (
        matchesSearch && matchesCategory && matchesCollection && matchesStatus
      );
    });
  }, [products, searchTerm, categoryFilter, collectionFilter, statusFilter]);

  // ─── Stats ─────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    }),
    [products],
  );

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

  // ─── Toggle visibility ─────────────────────────────────────
  const handleToggleVisibility = async (product) => {
    if (toggling) return;
    setToggling(product.id);
    try {
      await productService.updateProduct(product.id, {
        isActive: !product.isActive,
      });
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

  // ─── Delete product ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast("success", `"${deleteTarget.name}" has been deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      showToast("error", err.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-[#212121] md:mt-5 pb-20">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          msg={toast.msg}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-[18px] font-medium text-[#212121]">
              Product Catalog
            </h1>
            <p className="text-[12px] text-[#878787] hidden sm:block">
              Manage your inventory, pricing, and visibility
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadProducts(true)}
              disabled={loading}
              title="Refresh Data"
              className="p-2.5 rounded-sm border border-[#d7d7d7] bg-white hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <RefreshCw
                size={18}
                className={loading ? "animate-spin text-[#2874F0]" : ""}
              />
            </button>
            <button
              onClick={() => navigate("/products/create")}
              className="flex items-center justify-center gap-2 bg-[#FB641B] text-white px-5 py-2.5 rounded-sm font-medium text-[14px] shadow-[0_1px_2px_0_rgba(0,0,0,0.2)] hover:bg-[#f4511e] active:scale-95 transition-all min-w-[150px]">
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* User Guide Banner */}
        {showGuide && (
          <div className="bg-[#f4f8fc] border border-[#d0e3f5] rounded-sm p-5 relative shadow-sm animate-in fade-in duration-300">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-[#878787] hover:text-[#212121] transition-colors"
              title="Dismiss guide">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} className="text-[#2874F0]" />
              <h2 className="text-[15px] font-semibold text-[#212121]">
                Seller Dashboard Guide
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px] text-[#424242] leading-relaxed">
              <div>
                <strong className="text-[#212121] block mb-1">
                  📊 Monitor Stats
                </strong>
                Keep an eye on the top metric cards. They instantly tell you if
                items are out of stock or running low so you can restock in
                time.
              </div>
              <div>
                <strong className="text-[#212121] block mb-1">
                  🔍 Smart Filtering
                </strong>
                Use the filter bar below to quickly isolate products by
                Category, Collection, or Status (e.g., finding all hidden
                items).
              </div>
              <div>
                <strong className="text-[#212121] block mb-1">
                  👁️ Quick Toggle
                </strong>
                Click the Eye icon in the table to instantly hide a product from
                customers without deleting it. Great for seasonal items!
              </div>
              <div>
                <strong className="text-[#212121] block mb-1">
                  ✍️ Manage Listings
                </strong>
                Click "Edit" to update prices, add new colors, or change sizes.
                Use the orange "Add Product" button top right for new inventory.
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.total}
            color="bg-[#2874F0]"
          />
          <StatCard
            icon={BarChart2}
            label="Live on Storefront"
            value={stats.active}
            color="bg-[#2e7d32]" // Flipkart success green
          />
          <StatCard
            icon={TrendingDown}
            label="Low Stock Alert"
            value={stats.lowStock}
            color="bg-[#f5a623]" // Flipkart warning orange/yellow
          />
          <StatCard
            icon={AlertCircle}
            label="Out of Stock"
            value={stats.outOfStock}
            color="bg-[#e91e63]" // Flipkart red/pink alert
          />
        </div>

        {/* Main Content Area (Filters + Table wrapped in a clean card format) */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Filters Component */}
          <div className="border-b border-gray-200 bg-white">
            <Filters
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              collectionFilter={collectionFilter}
              setCollectionFilter={setCollectionFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Product Table Component */}
          <ProductTable
            products={filteredProducts}
            loading={loading}
            hasMore={hasMore}
            loadingMore={loadingMore}
            handleToggleVisibility={handleToggleVisibility}
            setDeleteTarget={setDeleteTarget}
            navigate={navigate}
            getDiscount={getDiscount}
            formatPKR={formatPKR}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-[#ffebee] border border-[#ffcdd2] rounded-sm text-[#c62828] shadow-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[14px] font-medium">{error}</p>
              <button
                onClick={() => loadProducts(true)}
                className="text-[13px] text-[#e53935] hover:text-[#b71c1c] font-semibold mt-1.5 transition-colors">
                Click here to try fetching again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagementPage;
