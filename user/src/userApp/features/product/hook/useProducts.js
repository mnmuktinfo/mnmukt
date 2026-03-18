import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/ProductService";

/*
────────────────────────────────────────
Query Keys
────────────────────────────────────────
*/

export const PRODUCT_KEYS = {
  all: () => ["products", "all"],
  byId: (id) => ["products", "id", String(id)],
  bySlug: (slug) => ["products", "slug", slug],
  byCategory: (cat) => ["products", "category", cat],
  byCollection: (types, limit) => [
    "products",
    "collection",
    [...types].sort().join(","),
    limit,
  ],
  byIds: (ids) => ["products", "ids", [...ids].sort().join(",")],
};

/*
────────────────────────────────────────
Query Config
────────────────────────────────────────
*/

const STALE = 30 * 60 * 1000;
const GC = 60 * 60 * 1000;

const Q_OPTS = {
  staleTime: STALE,
  gcTime: GC,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: "always",
};

export const useProducts = () => {
  const qc = useQueryClient();
  const [errors, setErrors] = useState({});

  /*
  ────────────────────────────────────────
  Normalize Helper
  ────────────────────────────────────────
  */

  const normalizeProducts = useCallback(
    (products) => {
      if (!products) return;

      const list = Array.isArray(products) ? products : [products];

      list.forEach((p) => {
        if (!p) return;

        qc.setQueryData(PRODUCT_KEYS.byId(p.id), p);

        if (p.slug) {
          qc.setQueryData(PRODUCT_KEYS.bySlug(p.slug), p);
        }
      });
    },
    [qc]
  );

  /*
  ────────────────────────────────────────
  Cache-first Fetch Helper
  ────────────────────────────────────────
  */

  const fetchIt = useCallback(
    async (key, fetchFn, primeType = null) => {
      try {
        const cached = qc.getQueryData(key);

        if (cached) return cached;

        const res = await qc.fetchQuery({
          queryKey: key,
          queryFn: fetchFn,
          ...Q_OPTS,
        });

        if (res) normalizeProducts(res);

        return res;
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [JSON.stringify(key)]: err.message,
        }));

        return primeType === "array" ? [] : null;
      }
    },
    [qc, normalizeProducts]
  );

  /*
  ────────────────────────────────────────
  Prefetch (hover optimizations)
  ────────────────────────────────────────
  */

  const prefetchBySlug = useCallback(
    (slug) => {
      if (!slug) return;

      qc.prefetchQuery({
        queryKey: PRODUCT_KEYS.bySlug(slug),
        queryFn: () => productService.getProductBySlug(slug),
        staleTime: STALE,
      });
    },
    [qc]
  );

  const prefetchById = useCallback(
    (id) => {
      if (!id) return;

      qc.prefetchQuery({
        queryKey: PRODUCT_KEYS.byId(id),
        queryFn: () => productService.getProductById(id),
        staleTime: STALE,
      });
    },
    [qc]
  );

  const prefetchCategory = useCallback(
    (categoryId) => {
      console.log(categoryId)
      if (!categoryId) return;

      qc.prefetchQuery({
        queryKey: PRODUCT_KEYS.byCategory(categoryId),
        queryFn: () => productService.getProductsByCategory(categoryId),
        staleTime: STALE,
      });
    },
    [qc]
  );

  const prefetchNextPage = useCallback(
    (lastDoc) => {
      if (!lastDoc) return;

      qc.prefetchQuery({
        queryKey: ["products", "page", lastDoc?.id],
        queryFn: () => productService.getProducts({ lastDoc }),
        staleTime: STALE,
      });
    },
    [qc]
  );

  /*
  ────────────────────────────────────────
  Queries
  ────────────────────────────────────────
  */

  const getProductBySlug = useCallback(
    async (slug) => {
      if (!slug) return null;

      const cached = qc.getQueryData(PRODUCT_KEYS.bySlug(slug));
      if (cached) return cached;

      return fetchIt(
        PRODUCT_KEYS.bySlug(slug),
        () => productService.getProductBySlug(slug),
        "single"
      );
    },
    [fetchIt, qc]
  );

  const getProductById = useCallback(
    async (id) => {
      if (!id) return null;

      const cached = qc.getQueryData(PRODUCT_KEYS.byId(id));
      if (cached) return cached;

      return fetchIt(
        PRODUCT_KEYS.byId(id),
        () => productService.getProductById(id),
        "single"
      );
    },
    [fetchIt, qc]
  );

  const getProductsByCategory = useCallback(
    async (cat) => {
      if (!cat) return [];

      return fetchIt(
        PRODUCT_KEYS.byCategory(cat),
        () => productService.getProductsByCategory(cat),
        "array"
      );
    },
    [fetchIt]
  );

  const getProductsByCategoryLimited = useCallback(
  async (categoryId, limit = 5) => {
    if (!categoryId) return [];

    // Create a unique query key including the limit
    const key = ["products", "category", categoryId, "limit", limit];

    // Check cache first
    const cached = qc.getQueryData(key);
    if (cached) return cached;

    // Fetch from service with limit
    return fetchIt(
      key,
      async () => {
        const allProducts = await productService.getProductsByCategory(categoryId);
        return allProducts?.slice(0, limit) || [];
      },
      "array"
    );
  },
  [fetchIt, qc]
);

  const getProductsByIds = useCallback(
  async (ids = []) => {
    if (!ids.length) return [];

    const sortedIds = [...ids].sort();

    const cached = qc.getQueryData(PRODUCT_KEYS.byIds(sortedIds));
    if (cached) return cached;

    return fetchIt(
      PRODUCT_KEYS.byIds(sortedIds),
      () => productService.getProductsByIds(sortedIds),
      "array"
    );
  },
  [fetchIt, qc]
);
  /*
  ────────────────────────────────────────
  Search
  ────────────────────────────────────────
  */

  const searchProducts = useCallback(
    async (term) => {
      const cached = qc.getQueryData(PRODUCT_KEYS.all());

      if (cached) {
        return productService.searchProducts(term, cached);
      }

      const products = await fetchIt(
        PRODUCT_KEYS.all(),
        () => productService.getAllProducts(),
        "array"
      );

      return productService.searchProducts(term, products);
    },
    [fetchIt, qc]
  );

  /*
  ────────────────────────────────────────
  Return API
  ────────────────────────────────────────
  */

  return {
    errors,

    getProductBySlug,
    getProductById,
    getProductsByCategory,
    searchProducts,
getProductsByIds,
    prefetchBySlug,
    prefetchById,
    prefetchCategory,
    prefetchNextPage,
    getProductsByCategoryLimited
  };
};