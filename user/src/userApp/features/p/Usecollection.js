/**
 * useCollection.js  — MNMUKT
 *
 * React Query infinite-scroll hook for CollectionPage
 *
 * What this does:
 *   • Reads filters from URL searchParams (shareable, back-button safe)
 *   • Fetches paginated products via productService.getProducts()
 *   • All filtering + sorting happens CLIENT-SIDE → zero extra Firestore reads
 *   • Exposes facet counts (sizes/colors) derived from all fetched products
 *
 * Fixes applied:
 *   [1] Calls getProducts() not getCollection() — matches actual service method
 *   [2] Uses `category` + `lastDoc` param names — matches service signature
 *   [3] Cursor reads lastPage.lastDoc — matches service return shape
 *   [4] inStock: checks p.inStock (normalized bool) with p.stock === 0 fallback
 *   [5] priceMin/priceMax read as Numbers from URL string before comparison
 *   [6] Hook owns URL reading internally — CollectionPage doesn't pass filters down
 */

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "./Productservice";

/* ─────────────────────────────────────────────────────
   URL FILTER PARSER
   Reads all searchParams into { key: [value, ...] }.
   Values are always string arrays — coerce before use.
───────────────────────────────────────────────────── */

const useURLFilters = () => {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const filters = {};

    for (const [key, value] of searchParams.entries()) {
      if (!filters[key]) filters[key] = [];
      filters[key].push(value);
    }

    return filters;
  }, [searchParams]);
};

/* ─────────────────────────────────────────────────────
   CLIENT FILTER
   All comparisons are null-safe and case-insensitive.
───────────────────────────────────────────────────── */

export const filterProducts = (products, filters = {}) => {
  // FIX [5]: extract numeric bounds once — URL values are strings
  const minVal = filters.priceMin?.length
    ? Number(filters.priceMin[0])
    : null;
  const maxVal = filters.priceMax?.length
    ? Number(filters.priceMax[0])
    : null;

  return products.filter((p) => {

    /* SIZE — any match passes */
    if (filters.sizes?.length) {
      if (!filters.sizes.some((s) => p.sizes?.includes(s))) return false;
    }

    /* COLOR — case-insensitive any match */
    if (filters.colors?.length) {
      if (
        !filters.colors.some((c) =>
          p.colors?.some(
            (pc) =>
              typeof pc === "string" &&
              typeof c  === "string" &&
              pc.toLowerCase() === c.toLowerCase()
          )
        )
      ) return false;
    }

    /* GENERIC FIELD FILTERS (category, brand, etc.)
       Anything in the URL that isn't a known special key
       is matched directly against p[key]. */
    const SKIP = ["sizes", "colors", "priceMin", "priceMax", "inStock", "search"];
    for (const key in filters) {
      if (SKIP.includes(key)) continue;
      const values = filters[key];
      if (!values?.length) continue;
      const productVal = p[key];
      if (productVal == null) return false;
      const match = values.some(
        (v) => String(productVal).toLowerCase() === String(v).toLowerCase()
      );
      if (!match) return false;
    }

    /* PRICE — FIX [5]: use pre-extracted Numbers */
    if (minVal != null && !isNaN(minVal) && p.price < minVal) return false;
    if (maxVal != null && !isNaN(maxVal) && p.price > maxVal) return false;

    /* STOCK — FIX [4]: URL gives string "true"
       p.inStock is a normalized boolean set by productService.normalize().
       Fall back to p.stock === 0 if inStock wasn't stored on the document. */
    if (filters.inStock?.[0] === "true") {
      const outOfStock = p.inStock === false || (p.inStock == null && p.stock === 0);
      if (outOfStock) return false;
    }

    /* SEARCH — name / description / tags */
    if (filters.search?.length) {
      const q = filters.search[0].toLowerCase();
      const hit =
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q));
      if (!hit) return false;
    }

    return true;
  });
};

/* ─────────────────────────────────────────────────────
   CLIENT SORT
───────────────────────────────────────────────────── */

export const sortProducts = (products, sort) => {
  const arr = [...products];

  switch (sort) {
    case "price_asc":
      return arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price_desc":
      return arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "name_asc":
      return arr.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    case "name_desc":
      return arr.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
    case "newest":
    default:
      return arr.sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      );
  }
};

/* ─────────────────────────────────────────────────────
   HOOK
   FIX [6]: No `filters` prop — hook reads URL internally.
            CollectionPage only passes collectionType/categoryId/sort/pageSize.
───────────────────────────────────────────────────── */

export const useCollection = ({
  collectionType = "all",
  categoryId     = null,
  sort           = "newest",
  pageSize       = 20,
}) => {
  /* URL filters — owned here, not passed from parent */
  const urlFilters = useURLFilters();

  /* ── Infinite Query ──────────────────────────────── */
  const infiniteQuery = useInfiniteQuery({

    queryKey: ["collection", collectionType, categoryId, pageSize],

    queryFn: ({ pageParam = null }) =>
      // FIX [1]: correct method name  (getProducts, not getCollection)
      // FIX [2]: correct param names  (category, lastDoc)
      productService.getProducts({
        collectionType,
        category:  categoryId ?? "all",  // FIX [2]: was categoryId: ...
        lastDoc:   pageParam,            // FIX [2]: was lastDocSnapshot: ...
        pageSize,
      }),

    // FIX [3]: service returns `lastDoc`, not `lastSnap`
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,

    staleTime:           5 * 60 * 1000,   // 5 min — matches service TTL
    gcTime:             30 * 60 * 1000,   // 30 min in React Query cache
    refetchOnWindowFocus: false,
  });

  /* ── Flatten all fetched pages ───────────────────── */
  const allProducts = useMemo(
    () => (infiniteQuery.data?.pages ?? []).flatMap((p) => p.products),
    [infiniteQuery.data?.pages]
  );

  /* ── Client-side filter + sort ───────────────────── */
  const displayProducts = useMemo(
    () => sortProducts(filterProducts(allProducts, urlFilters), sort),
    [allProducts, urlFilters, sort]
  );

  /* ── Facets (powers filter count badges) ─────────── */
  const facets = useMemo(() => {
    const sizes  = new Map();
    const colors = new Map();

    allProducts.forEach((p) => {
      p.sizes?.forEach((s) => {
        if (!s) return;
        sizes.set(s, (sizes.get(s) ?? 0) + 1);
      });
      p.colors?.forEach((c) => {
        if (!c) return;
        const key = String(c).toLowerCase();
        colors.set(key, (colors.get(key) ?? 0) + 1);
      });
    });

    return { sizes, colors };
  }, [allProducts]);

  /* ── Public API ──────────────────────────────────── */
  return {
    /* Data */
    displayProducts,
    allProducts,
    facets,
    totalFetched: allProducts.length,

    /* Pagination */
    fetchNextPage:      infiniteQuery.fetchNextPage,
    hasNextPage:        infiniteQuery.hasNextPage ?? false,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,

    /* Status */
    isLoading: infiniteQuery.isLoading,
    isError:   infiniteQuery.isError,
    error:     infiniteQuery.error,
  };
};