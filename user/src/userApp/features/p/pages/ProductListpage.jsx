/**
 * ProductListPage.jsx — MNMUKT
 *
 * Architecture:
 *  • Single Firestore fetch per "load more" — cursor-based pagination (startAfter)
 *  • All filtering + sorting done CLIENT-SIDE on already-fetched docs
 *    → zero repeat API calls when user toggles filters/sort
 *  • useRef cursor so re-renders never lose pagination position
 *  • React.memo + useCallback on ProductCard keep renders surgical
 *
 * Route: /products  OR  /category/:categorySlug
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../../../../config/firebaseAuth";
import {
  SlidersHorizontal,
  Grid2X2,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  ArrowUpDown,
} from "lucide-react";
import ProductCard from "../../../components/cards/ProductCard"; // your existing card

/* ─────────────────────────────────────
   CONSTANTS
───────────────────────────────────── */
const PAGE_SIZE = 20; // docs fetched per Firestore call

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 499 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
];

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const sortProducts = (products, sortValue) => {
  const arr = [...products];
  switch (sortValue) {
    case "price_asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price_desc":
      return arr.sort((a, b) => b.price - a.price);
    case "name_asc":
      return arr.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    case "createdAt_desc":
    default:
      return arr.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0;
        const tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });
  }
};

const applyClientFilters = (products, filters) => {
  return products.filter((p) => {
    // Category
    if (filters.categories.length > 0) {
      const cat = (p.category ?? "").toLowerCase();
      if (!filters.categories.some((c) => cat.includes(c.toLowerCase())))
        return false;
    }
    // Size
    if (filters.sizes.length > 0) {
      const pSizes = [
        ...(p.sizes ?? []),
        ...(p.availableSizes ?? []),
        p.size,
      ].filter(Boolean);
      if (!filters.sizes.some((s) => pSizes.includes(s))) return false;
    }
    // Price
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (p.price < min || p.price > max) return false;
    }
    // Availability
    if (filters.inStock) {
      if (p.stock === 0 || p.inStock === false) return false;
    }
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack =
        `${p.name ?? ""} ${p.category ?? ""} ${p.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
};

/* ─────────────────────────────────────
   FILTER ACCORDION ITEM
───────────────────────────────────── */
const FilterSection = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left">
        <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-700">
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

/* ─────────────────────────────────────
   FILTER SIDEBAR
───────────────────────────────────── */
const FilterSidebar = ({
  filters,
  setFilters,
  allCategories,
  onClose,
  isMobile,
}) => {
  const toggle = (key, value) =>
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });

  const clearAll = () =>
    setFilters({
      categories: [],
      sizes: [],
      priceRange: null,
      inStock: false,
      search: "",
    });

  const activeCount =
    filters.categories.length +
    filters.sizes.length +
    (filters.priceRange ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div
      className={`bg-white flex flex-col h-full ${
        isMobile ? "w-full" : "w-[220px] lg:w-[240px] flex-shrink-0"
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-gray-500" />
          <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-800">
            Filters
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-[#da127d] px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] font-semibold text-[#da127d] hover:underline">
              Clear all
            </button>
          )}
          {isMobile && (
            <button onClick={onClose}>
              <X size={18} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Body */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {/* Category */}
        {allCategories.length > 0 && (
          <FilterSection title="Category" defaultOpen>
            <div className="flex flex-col gap-2">
              {allCategories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => toggle("categories", cat)}
                    className="w-3.5 h-3.5 accent-[#da127d] cursor-pointer"
                  />
                  <span className="text-[12px] text-gray-600 group-hover:text-gray-900 capitalize">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Size */}
        <FilterSection title="Size" defaultOpen>
          <div className="flex flex-wrap gap-1.5">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggle("sizes", s)}
                className={`text-[11px] font-semibold px-2.5 py-1 border transition-colors duration-200 ${
                  filters.sizes.includes(s)
                    ? "bg-[#da127d] border-[#da127d] text-white"
                    : "border-gray-200 text-gray-600 hover:border-[#da127d] hover:text-[#da127d]"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price">
          <div className="flex flex-col gap-2">
            {PRICE_RANGES.map((r) => (
              <label
                key={r.label}
                className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={
                    filters.priceRange?.min === r.min &&
                    filters.priceRange?.max === r.max
                  }
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      priceRange:
                        prev.priceRange?.min === r.min
                          ? null
                          : { min: r.min, max: r.max },
                    }))
                  }
                  className="accent-[#da127d] cursor-pointer"
                />
                <span className="text-[12px] text-gray-600 group-hover:text-gray-900">
                  {r.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={() =>
                setFilters((prev) => ({ ...prev, inStock: !prev.inStock }))
              }
              className="w-3.5 h-3.5 accent-[#da127d] cursor-pointer"
            />
            <span className="text-[12px] text-gray-600">In stock only</span>
          </label>
        </FilterSection>
      </div>

      {/* Mobile apply button */}
      {isMobile && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#da127d] text-white text-[12px] font-bold uppercase tracking-widest">
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────
   SKELETON CARD
───────────────────────────────────── */
const SkeletonCard = () => (
  <div className="flex flex-col w-full animate-pulse">
    <div className="w-full aspect-[3/4] bg-gray-100" />
    <div className="pt-3 space-y-2 px-1">
      <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mx-auto" />
    </div>
  </div>
);

/* ─────────────────────────────────────
   ACTIVE FILTER CHIPS  (top bar)
───────────────────────────────────── */
const ActiveChips = ({ filters, setFilters }) => {
  const chips = [
    ...filters.categories.map((c) => ({
      label: c,
      remove: () =>
        setFilters((p) => ({
          ...p,
          categories: p.categories.filter((x) => x !== c),
        })),
    })),
    ...filters.sizes.map((s) => ({
      label: `Size: ${s}`,
      remove: () =>
        setFilters((p) => ({ ...p, sizes: p.sizes.filter((x) => x !== s) })),
    })),
    ...(filters.priceRange
      ? [
          {
            label:
              PRICE_RANGES.find(
                (r) =>
                  r.min === filters.priceRange.min &&
                  r.max === filters.priceRange.max,
              )?.label ?? "Price",
            remove: () => setFilters((p) => ({ ...p, priceRange: null })),
          },
        ]
      : []),
    ...(filters.inStock
      ? [
          {
            label: "In stock",
            remove: () => setFilters((p) => ({ ...p, inStock: false })),
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#da127d] bg-pink-50 border border-pink-100 px-2.5 py-1">
          {chip.label}
          <button onClick={chip.remove}>
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
const ProductListPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ── State ── */
  const [allFetched, setAllFetched] = useState([]); // raw Firestore docs (grows with Load More)
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [gridCols, setGridCols] = useState(4); // 2 | 3 | 4
  const [sort, setSort] = useState("createdAt_desc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [filters, setFilters] = useState({
    categories: categorySlug ? [categorySlug] : [],
    sizes: [],
    priceRange: null,
    inStock: false,
    search: searchParams.get("q") ?? "",
  });

  /* ── Firestore cursor (never stale) ── */
  const cursorRef = useRef(null);
  const collectionRef = collection(db, "products");

  /* ── Derived: unique categories from fetched docs ── */
  const allCategories = useMemo(() => {
    const cats = new Set(allFetched.map((p) => p.category).filter(Boolean));
    return [...cats].sort();
  }, [allFetched]);

  /* ── Derived: filtered + sorted products (client-side, zero extra fetch) ── */
  const displayProducts = useMemo(() => {
    const filtered = applyClientFilters(allFetched, filters);
    return sortProducts(filtered, sort);
  }, [allFetched, filters, sort]);

  /* ─────────────────────────────────────
     FETCH  — called only for new pages
  ───────────────────────────────────── */
  const fetchProducts = useCallback(
    async (isFirstLoad = false) => {
      if (isFirstLoad) {
        setLoading(true);
        cursorRef.current = null;
      } else {
        if (!hasMore) return;
        setLoadingMore(true);
      }

      try {
        /* Build base constraints — keep Firestore query minimal;
           filtering is done client-side to avoid index explosion */
        const constraints = [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];

        // Only add a where clause if we're on a category route
        // and it's the very first load — avoids re-adding the constraint
        // on "load more" (cursor already scoped)
        if (categorySlug && isFirstLoad) {
          constraints.unshift(where("category", "==", categorySlug));
        }

        if (cursorRef.current) {
          constraints.push(startAfter(cursorRef.current));
        }

        const snap = await getDocs(query(collectionRef, ...constraints));

        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        cursorRef.current = snap.docs[snap.docs.length - 1] ?? null;
        setHasMore(docs.length === PAGE_SIZE);

        setAllFetched((prev) => (isFirstLoad ? docs : [...prev, ...docs]));
      } catch (err) {
        console.error("[ProductListPage] fetch error:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categorySlug, hasMore],
  );

  /* Initial load */
  useEffect(() => {
    fetchProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  /* ── Intersection Observer for load-more sentinel ── */
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchProducts(false);
        }
      },
      { rootMargin: "300px" },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, fetchProducts]);

  /* ── Close sort menu on outside click ── */
  useEffect(() => {
    if (!showSortMenu) return;
    const handler = () => setShowSortMenu(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [showSortMenu]);

  /* ── Page title ── */
  const pageTitle = categorySlug
    ? categorySlug.charAt(0).toUpperCase() +
      categorySlug.slice(1).replace(/-/g, " ")
    : "All Products";

  /* ── Grid class ── */
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[gridCols];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Mobile Filter Drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="w-[80vw] max-w-[320px] h-full bg-white shadow-xl overflow-hidden flex flex-col">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              allCategories={allCategories}
              onClose={() => setShowMobileFilters(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-0">
        <p className="text-[11px] text-gray-400 font-medium">
          <button onClick={() => navigate("/")} className="hover:text-gray-700">
            Home
          </button>{" "}
          / <span className="text-gray-600">{pageTitle}</span>
        </p>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex gap-0 px-4 sm:px-6 lg:px-8 pt-4">
        {/* ── Sidebar (desktop only) ── */}
        <div className="hidden lg:flex flex-col mr-8 flex-shrink-0 w-[220px]">
          <div className="sticky top-4">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              allCategories={allCategories}
              onClose={() => {}}
              isMobile={false}
            />
          </div>
        </div>

        {/* ── Products Column ── */}
        <div className="flex-1 min-w-0">
          {/* ── Top Bar ── */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            {/* Left: title + count */}
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 border border-gray-200 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-700 hover:border-gray-400 transition-colors">
                <SlidersHorizontal size={13} />
                Filter
                {filters.categories.length +
                  filters.sizes.length +
                  (filters.priceRange ? 1 : 0) +
                  (filters.inStock ? 1 : 0) >
                  0 && (
                  <span className="ml-1 text-[10px] font-bold text-white bg-[#da127d] px-1.5 py-0.5 rounded-full leading-none">
                    {filters.categories.length +
                      filters.sizes.length +
                      (filters.priceRange ? 1 : 0) +
                      (filters.inStock ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Page title with pink brush underline */}
              <div className="relative hidden sm:block">
                <h1 className="text-[18px] sm:text-[22px] font-black uppercase tracking-tight text-gray-900 leading-none">
                  {pageTitle}
                </h1>
                <div
                  className="absolute -bottom-1 left-0 h-[6px] w-full opacity-40 -z-10"
                  style={{ background: "#da127d", borderRadius: 2 }}
                />
              </div>

              {!loading && (
                <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                  {displayProducts.length} products
                </span>
              )}
            </div>

            {/* Right: search + grid toggle + sort */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, search: e.target.value }))
                  }
                  className="pl-7 pr-3 py-2 text-[11px] border border-gray-200 focus:outline-none focus:border-[#da127d] w-[130px] sm:w-[180px] transition-colors"
                />
              </div>

              {/* Grid toggles */}
              <div className="hidden sm:flex border border-gray-200 divide-x divide-gray-200">
                {[
                  { cols: 2, Icon: List },
                  { cols: 3, Icon: Grid2X2 },
                  { cols: 4, Icon: LayoutGrid },
                ].map(({ cols, Icon }) => (
                  <button
                    key={cols}
                    onClick={() => setGridCols(cols)}
                    className={`p-2 transition-colors ${
                      gridCols === cols
                        ? "bg-[#da127d] text-white"
                        : "text-gray-400 hover:text-gray-700"
                    }`}>
                    <Icon size={14} />
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortMenu((v) => !v);
                  }}
                  className="flex items-center gap-1.5 border border-gray-200 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-700 hover:border-gray-400 transition-colors">
                  <ArrowUpDown size={13} />
                  <span className="hidden sm:inline">
                    {SORT_OPTIONS.find((o) => o.value === sort)?.label ??
                      "Sort"}
                  </span>
                  <span className="sm:hidden">Sort</span>
                </button>
                {showSortMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-30 w-[190px]"
                    onClick={(e) => e.stopPropagation()}>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSort(opt.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[12px] hover:bg-gray-50 transition-colors ${
                          sort === opt.value
                            ? "font-bold text-[#da127d]"
                            : "text-gray-600"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile title */}
          <div className="sm:hidden mb-3 relative w-fit">
            <h1 className="text-[20px] font-black uppercase tracking-tight text-gray-900 leading-none">
              {pageTitle}
            </h1>
            <div
              className="absolute -bottom-0.5 left-0 h-[5px] w-full opacity-40 -z-10"
              style={{ background: "#da127d" }}
            />
          </div>

          {/* Active filter chips */}
          <ActiveChips filters={filters} setFilters={setFilters} />

          {/* ── Product Grid ── */}
          {loading ? (
            <div className={`grid ${gridClass} gap-x-4 gap-y-8`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <p className="text-[15px] font-bold text-gray-800 mb-1">
                No products found
              </p>
              <p className="text-[13px] text-gray-400 mb-5">
                Try adjusting your filters or search term
              </p>
              <button
                onClick={() =>
                  setFilters({
                    categories: [],
                    sizes: [],
                    priceRange: null,
                    inStock: false,
                    search: "",
                  })
                }
                className="text-[12px] font-bold uppercase tracking-widest text-white bg-[#da127d] px-6 py-3">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid ${gridClass} gap-x-4 gap-y-8`}>
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Skeleton rows while loading more */}
              {loadingMore && (
                <div className={`grid ${gridClass} gap-x-4 gap-y-8 mt-8`}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {/* Invisible sentinel — triggers next fetch */}
              <div ref={sentinelRef} className="h-1" />

              {/* End of results */}
              {!hasMore && displayProducts.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-300">
                    — End of results —
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
