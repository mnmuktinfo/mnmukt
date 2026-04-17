import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/ProductService";

// ─────────────────────────────────────────────────────────────
// DEV LOGGER — stripped in production builds
// ─────────────────────────────────────────────────────────────

const IS_DEV = import.meta.env.DEV;
const log = {
  warn: (...a) => IS_DEV && console.warn("[useProducts]", ...a),
  error: (...a) => IS_DEV && console.error("[useProducts]", ...a),
  info: (...a) => IS_DEV && console.info("[useProducts]", ...a),
};

// ─────────────────────────────────────────────────────────────
// QUERY KEYS
// ─────────────────────────────────────────────────────────────

export const PRODUCT_KEYS = {
  all: () => ["products", "all"],
  byId: (id) => ["products", "id", String(id)],
  bySlug: (slug) => ["products", "slug", slug],
  byCategory: (cat) => ["products", "category", String(cat)],
  byCategoryLimited: (cat, lim) => ["products", "category", String(cat), "limit", lim],
  byCollection: (types, lim) => [
    "products",
    "collection",
    [...types].sort().join(","),
    lim,
  ],
  byIds: (ids) => ["products", "ids", [...ids].sort().join(",")],
  search: (term) => ["products", "search", term?.trim().toLowerCase()],
};

// ─────────────────────────────────────────────────────────────
// CACHE CONFIG
// ─────────────────────────────────────────────────────────────

const STALE_TIME = 30 * 60 * 1000; // 30 min
const GC_TIME   = 60 * 60 * 1000; // 60 min

const Q_OPTS = {
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: "always",
  retry: (failureCount, error) => {
    if (error?.code === "not-found" || error?.status === 404) return false;
    return failureCount < 2;
  },
};

// ─────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────

export const useProducts = () => {
  const qc = useQueryClient();
  const [errors, setErrors] = useState({});
  const inflightRef = useRef(new Map());

  // ── Error helpers ──────────────────────────────────────────

  const _setError = useCallback((key, err) => {
    const keyStr = JSON.stringify(key);
    log.error(`Query failed [${keyStr}]:`, err.message);
    setErrors((prev) => ({
      ...prev,
      [keyStr]: { message: err.message, timestamp: Date.now(), key },
    }));
  }, []);

  const clearError = useCallback((key) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[JSON.stringify(key)];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => setErrors({}), []);

  const getError = useCallback(
    (key) => errors[JSON.stringify(key)] ?? null,
    [errors]
  );

  // ── Normalize ──────────────────────────────────────────────

  const normalizeProducts = useCallback(
    (products) => {
      if (!products) return;
      const list = Array.isArray(products) ? products : [products];
      list.forEach((p) => {
        if (!p?.id) {
          log.warn("Product missing 'id', skipping normalization:", p);
          return;
        }
        qc.setQueryData(PRODUCT_KEYS.byId(p.id), p);
        if (p.slug) qc.setQueryData(PRODUCT_KEYS.bySlug(p.slug), p);
      });
    },
    [qc]
  );

  // ── fetchIt ────────────────────────────────────────────────

  const fetchIt = useCallback(
    async (key, fetchFn, type = "single") => {
      const keyStr = JSON.stringify(key);

      if (inflightRef.current.has(keyStr)) {
        log.info(`Deduplicating in-flight request: ${keyStr}`);
        return inflightRef.current.get(keyStr);
      }

      const promise = (async () => {
        try {
          const res = await qc.fetchQuery({
            queryKey: key,
            queryFn: fetchFn,
            ...Q_OPTS,
          });

          if (res) {
            normalizeProducts(res);
            clearError(key);
          }

          return res ?? (type === "array" ? [] : null);
        } catch (err) {
          _setError(key, err);
          return type === "array" ? [] : null;
        } finally {
          inflightRef.current.delete(keyStr);
        }
      })();

      inflightRef.current.set(keyStr, promise);
      return promise;
    },
    [qc, normalizeProducts, _setError, clearError]
  );

  // ─────────────────────────────────────────────────────────
  // PREFETCH
  // ─────────────────────────────────────────────────────────

  const prefetchBySlug = useCallback(
    (slug) => {
      if (!slug) return Promise.resolve();
      return qc.prefetchQuery({
        queryKey: PRODUCT_KEYS.bySlug(slug),
        queryFn: () => productService.getProductBySlug(slug),
        staleTime: STALE_TIME,
      });
    },
    [qc]
  );

  const prefetchById = useCallback(
    (id) => {
      if (!id) return Promise.resolve();
      return qc.prefetchQuery({
        queryKey: PRODUCT_KEYS.byId(id),
        queryFn: () => productService.getProductById(id),
        staleTime: STALE_TIME,
      });
    },
    [qc]
  );

  const prefetchCategory = useCallback(
    (categoryId) => {
      if (!categoryId) return Promise.resolve();
      return qc.prefetchQuery({
        queryKey: PRODUCT_KEYS.byCategory(categoryId),
        queryFn: () => productService.getProductsByCategory(categoryId),
        staleTime: STALE_TIME,
      });
    },
    [qc]
  );

  const prefetchNextPage = useCallback(
    (lastDoc) => {
      if (!lastDoc?.id) return Promise.resolve();
      return qc.prefetchQuery({
        queryKey: ["products", "page", lastDoc.id],
        queryFn: () => productService.getProducts({ lastDoc }),
        staleTime: STALE_TIME,
      });
    },
    [qc]
  );

  // ─────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────

  const getProductBySlug = useCallback(
    (slug) => {
      if (!slug) return Promise.resolve(null);
      return fetchIt(
        PRODUCT_KEYS.bySlug(slug),
        () => productService.getProductBySlug(slug),
        "single"
      );
    },
    [fetchIt]
  );

  const getProductById = useCallback(
    (id) => {
      if (!id) return Promise.resolve(null);
      return fetchIt(
        PRODUCT_KEYS.byId(id),
        () => productService.getProductById(id),
        "single"
      );
    },
    [fetchIt]
  );

  const getProductsByCategory = useCallback(
    (cat) => {
      if (!cat) return Promise.resolve([]);
      return fetchIt(
        PRODUCT_KEYS.byCategory(cat),
        () => productService.getProductsByCategory(cat),
        "array"
      );
    },
    [fetchIt]
  );

  /**
   * 3-tier cache strategy:
   * 1. React Query limited-key cache  → instant
   * 2. Full-category RQ cache → slice, no Firestore read
   * 3. ProductService server-side limit query (only reads N docs)
   */
  const getProductsByCategoryLimited = useCallback(
    async (categoryId, lim = 5) => {
      if (!categoryId) return [];

      const limitedKey = PRODUCT_KEYS.byCategoryLimited(categoryId, lim);

      const limitedCached = qc.getQueryData(limitedKey);
      if (limitedCached) return limitedCached;

      const fullCached = qc.getQueryData(PRODUCT_KEYS.byCategory(categoryId));
      if (fullCached?.length) {
        const sliced = fullCached.slice(0, lim);
        qc.setQueryData(limitedKey, sliced);
        return sliced;
      }

      return fetchIt(
        limitedKey,
        () => productService.getProductsByCategoryLimited(categoryId, lim),
        "array"
      );
    },
    [fetchIt, qc]
  );

  /**
   * Resolves from individual byId caches first.
   * ProductService handles its own cache deduplication for missing IDs.
   */
  const getProductsByIds = useCallback(
    async (ids = []) => {
      if (!ids.length) return [];

      const sortedIds = [...ids].sort();
      const fromCache = sortedIds.map((id) => qc.getQueryData(PRODUCT_KEYS.byId(id)));
      if (fromCache.every(Boolean)) return fromCache;

      return fetchIt(
        PRODUCT_KEYS.byIds(sortedIds),
        () => productService.getProductsByIds(sortedIds),
        "array"
      );
    },
    [fetchIt, qc]
  );

  const getProductsByCollection = useCallback(
    (types = [], lim = 9) => {
      if (!types.length) return Promise.resolve([]);
      return fetchIt(
        PRODUCT_KEYS.byCollection(types, lim),
        () => productService.getProductsByCollections(types, lim),
        "array"
      );
    },
    [fetchIt]
  );

  // ─────────────────────────────────────────────────────────
  // SEARCH — 3-tier: search cache → catalog cache → fetch all
  // ─────────────────────────────────────────────────────────

  const searchProducts = useCallback(
    async (term) => {
      if (!term?.trim()) return [];

      const normalizedTerm = term.trim().toLowerCase();
      const searchKey = PRODUCT_KEYS.search(normalizedTerm);

      const cachedResult = qc.getQueryData(searchKey);
      if (cachedResult) return cachedResult;

      const allCached = qc.getQueryData(PRODUCT_KEYS.all());
      if (allCached?.length) {
        const results = productService.searchProducts(normalizedTerm, allCached);
        qc.setQueryData(searchKey, results);
        return results;
      }

      const products = await fetchIt(
        PRODUCT_KEYS.all(),
        () => productService.getAllProducts(),
        "array"
      );

      const results = productService.searchProducts(normalizedTerm, products ?? []);
      qc.setQueryData(searchKey, results);
      return results;
    },
    [fetchIt, qc]
  );

  // ─────────────────────────────────────────────────────────
  // CACHE INVALIDATION & MUTATION HELPERS
  // ─────────────────────────────────────────────────────────

  /**
   * Invalidate RQ + ProductService caches for one product.
   * Call inside mutation's onSuccess.
   */
  const invalidateProduct = useCallback(
    async (product) => {
      if (!product?.id) return;

      // Bust both cache layers simultaneously
      productService.bustCache(product.id, product.slug);

      await Promise.all([
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.byId(product.id) }),
        qc.invalidateQueries({ queryKey: PRODUCT_KEYS.all() }),
        product.slug &&
          qc.invalidateQueries({ queryKey: PRODUCT_KEYS.bySlug(product.slug) }),
        product.categoryId &&
          qc.invalidateQueries({
            queryKey: PRODUCT_KEYS.byCategory(product.categoryId),
          }),
      ].filter(Boolean));

      log.info(`Invalidated caches for product id="${product.id}"`);
    },
    [qc]
  );

  /**
   * Immediately reflect a mutation in UI before server confirms.
   * Pair with onMutate + onError rollback in your mutation.
   */
  const optimisticUpdateProduct = useCallback(
    (updatedProduct) => {
      if (!updatedProduct?.id) return;
      normalizeProducts(updatedProduct);
    },
    [normalizeProducts]
  );

  /**
   * Nuclear invalidation — clears everything.
   * Use after bulk imports or admin operations.
   */
  const invalidateAll = useCallback(async () => {
    productService.clearCache();
    await qc.invalidateQueries({ queryKey: ["products"] });
    log.info("All product caches invalidated");
  }, [qc]);

  // ─────────────────────────────────────────────────────────
  // RETURN API
  // ─────────────────────────────────────────────────────────

  return {
    // Queries
    getProductBySlug,
    getProductById,
    getProductsByCategory,
    getProductsByCategoryLimited,
    getProductsByCollection,
    getProductsByIds,
    searchProducts,

    // Prefetch
    prefetchBySlug,
    prefetchById,
    prefetchCategory,
    prefetchNextPage,

    // Mutations / Cache Control
    invalidateProduct,
    optimisticUpdateProduct,
    invalidateAll,

    // Error Management
    errors,
    getError,
    clearError,
    clearAllErrors,
  };
};